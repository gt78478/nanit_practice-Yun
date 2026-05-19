from __future__ import annotations

import re
import shutil
import zipfile
from copy import deepcopy
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[3]
REPORT_DIR = ROOT / "auxilary" / "docs" / "reports"
TARGET = REPORT_DIR / "ОТЧЕТ УП Юрченко.docx"
OLD = REPORT_DIR / "old_report-ОТЧЕТ_УП_Юрченко.docx"
BACKUP = REPORT_DIR / "ОТЧЕТ УП Юрченко.backup-before-auto-fill.docx"
FALLBACK = REPORT_DIR / "ОТЧЕТ УП Юрченко - заполненный.docx"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "xml": "http://www.w3.org/XML/1998/namespace",
}

for prefix, uri in NS.items():
    if prefix not in {"xml", "rel"}:
        ET.register_namespace(prefix, uri)


def qn(prefix: str, tag: str) -> str:
    return f"{{{NS[prefix]}}}{tag}"


def w(tag: str) -> str:
    return qn("w", tag)


def ensure(parent: ET.Element, tag: str) -> ET.Element:
    child = parent.find(w(tag))
    if child is None:
        child = ET.Element(w(tag))
        parent.insert(0, child)
    return child


def set_attr(node: ET.Element, attr: str, value: str) -> None:
    node.set(w(attr), value)


def remove_theme_font_attrs(rfonts: ET.Element) -> None:
    for attr in ("asciiTheme", "hAnsiTheme", "eastAsiaTheme", "cstheme"):
        rfonts.attrib.pop(w(attr), None)


def set_times_rpr(rpr: ET.Element) -> None:
    rfonts = rpr.find(w("rFonts"))
    if rfonts is None:
        rfonts = ET.Element(w("rFonts"))
        rpr.insert(0, rfonts)
    remove_theme_font_attrs(rfonts)
    for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
        set_attr(rfonts, attr, "Times New Roman")


def get_text(p: ET.Element) -> str:
    return "".join((t.text or "") for t in p.findall(".//w:t", NS)).strip()


def set_paragraph_text(p: ET.Element, text: str, *, bold: bool = False, italic: bool = False, size: str = "24") -> None:
    for child in list(p):
        if child.tag != w("pPr"):
            p.remove(child)
    r = ET.SubElement(p, w("r"))
    rpr = ET.SubElement(r, w("rPr"))
    set_times_rpr(rpr)
    if bold:
        ET.SubElement(rpr, w("b"))
    if italic:
        ET.SubElement(rpr, w("i"))
    ET.SubElement(rpr, w("sz")).set(w("val"), size)
    ET.SubElement(rpr, w("szCs")).set(w("val"), size)
    t = ET.SubElement(r, w("t"))
    t.set(qn("xml", "space"), "preserve")
    t.text = text


def paragraph(text: str = "", *, style: str | None = None, align: str | None = "both",
              bold: bool = False, italic: bool = False, size: str = "24") -> ET.Element:
    p = ET.Element(w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    if style:
        ET.SubElement(ppr, w("pStyle")).set(w("val"), style)
    if align:
        ET.SubElement(ppr, w("jc")).set(w("val"), align)
    r = ET.SubElement(p, w("r"))
    rpr = ET.SubElement(r, w("rPr"))
    set_times_rpr(rpr)
    if bold:
        ET.SubElement(rpr, w("b"))
    if italic:
        ET.SubElement(rpr, w("i"))
    ET.SubElement(rpr, w("sz")).set(w("val"), size)
    ET.SubElement(rpr, w("szCs")).set(w("val"), size)
    t = ET.SubElement(r, w("t"))
    t.set(qn("xml", "space"), "preserve")
    t.text = text
    return p


def code_paragraph(text: str) -> ET.Element:
    p = paragraph(text, align="left", size="18")
    rfonts = p.find(".//w:rFonts", NS)
    if rfonts is not None:
        for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
            set_attr(rfonts, attr, "Consolas")
    return p


def set_alignment(p: ET.Element, val: str) -> None:
    ppr = ensure(p, "pPr")
    jc = ppr.find(w("jc"))
    if jc is None:
        jc = ET.SubElement(ppr, w("jc"))
    jc.set(w("val"), val)


def set_style(p: ET.Element, style: str) -> None:
    ppr = ensure(p, "pPr")
    pstyle = ppr.find(w("pStyle"))
    if pstyle is None:
        pstyle = ET.Element(w("pStyle"))
        ppr.insert(0, pstyle)
    pstyle.set(w("val"), style)


def body_children(body: ET.Element) -> list[ET.Element]:
    return [child for child in list(body) if child.tag != w("sectPr")]


def insert_after(body: ET.Element, index: int, nodes: list[ET.Element]) -> None:
    for offset, node in enumerate(nodes, 1):
        body.insert(index + offset, node)


def append_expansion_after_heading(body: ET.Element, heading: str, nodes: list[ET.Element]) -> None:
    children = body_children(body)
    for idx, child in enumerate(children):
        if child.tag == w("p") and get_text(child) == heading:
            already = idx + 1 < len(children) and child.tag == w("p") and get_text(children[idx + 1]).startswith("Дополнительно в актуальной версии")
            if not already:
                insert_after(body, list(body).index(child), nodes)
            return


def make_toc_field() -> ET.Element:
    p = ET.Element(w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    ET.SubElement(ppr, w("jc")).set(w("val"), "both")
    fld = ET.SubElement(p, w("fldSimple"))
    fld.set(w("instr"), 'TOC \\o "1-3" \\h \\z \\u')
    r = ET.SubElement(fld, w("r"))
    rpr = ET.SubElement(r, w("rPr"))
    set_times_rpr(rpr)
    t = ET.SubElement(r, w("t"))
    t.text = "Оглавление будет построено Word по заголовкам документа. Обновите поле при открытии файла."
    return p


def normalize_styles(styles_xml: bytes) -> bytes:
    root = ET.fromstring(styles_xml)
    doc_defaults = root.find("w:docDefaults/w:rPrDefault/w:rPr", NS)
    if doc_defaults is None:
        doc_defaults = ET.SubElement(ET.SubElement(ET.SubElement(root, w("docDefaults")), w("rPrDefault")), w("rPr"))
    set_times_rpr(doc_defaults)

    for rpr in root.findall(".//w:rPr", NS):
        set_times_rpr(rpr)
    for style in root.findall(".//w:style", NS):
        sid = style.get(w("styleId"), "")
        name = style.find("w:name", NS)
        name_val = name.get(w("val"), "") if name is not None else ""
        if sid in {str(i) for i in range(1, 10)} or "heading" in name_val.lower() or "Заголовок" in name_val:
            rpr = style.find("w:rPr", NS)
            if rpr is None:
                rpr = ET.SubElement(style, w("rPr"))
            color = rpr.find(w("color"))
            if color is None:
                color = ET.SubElement(rpr, w("color"))
            color.set(w("val"), "000000")
            set_times_rpr(rpr)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def ensure_update_fields(settings_xml: bytes) -> bytes:
    root = ET.fromstring(settings_xml)
    update = root.find("w:updateFields", NS)
    if update is None:
        update = ET.Element(w("updateFields"))
        root.insert(0, update)
    update.set(w("val"), "true")
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def next_rid(rels_root: ET.Element) -> int:
    used = []
    for rel in rels_root:
        rid = rel.get("Id", "")
        if rid.startswith("rId") and rid[3:].isdigit():
            used.append(int(rid[3:]))
    return (max(used) + 1) if used else 1


def old_images_and_rels() -> tuple[list[ET.Element], dict[str, str], dict[str, bytes]]:
    with zipfile.ZipFile(OLD, "r") as z:
        old_doc = ET.fromstring(z.read("word/document.xml"))
        old_body = old_doc.find(".//w:body", NS)
        image_paras = []
        for child in list(old_body):
            if child.tag == w("p") and child.findall(".//w:drawing", NS):
                if len(image_paras) < 20:
                    image_paras.append(deepcopy(child))
        rels = ET.fromstring(z.read("word/_rels/document.xml.rels"))
        rid_target = {rel.get("Id"): rel.get("Target") for rel in rels if rel.get("Type", "").endswith("/image")}
        media = {name: z.read(name) for name in z.namelist() if name.startswith("word/media/")}
        return image_paras, rid_target, media


def remap_image_paragraph(p: ET.Element, rid_map: dict[str, str]) -> ET.Element:
    p = deepcopy(p)
    set_alignment(p, "center")
    for blip in p.findall(".//a:blip", NS):
        old_rid = blip.get(qn("r", "embed"))
        if old_rid in rid_map:
            blip.set(qn("r", "embed"), rid_map[old_rid])
    return p


def add_rel(rels_root: ET.Element, rid: str, target: str) -> None:
    rel = ET.SubElement(rels_root, qn("rel", "Relationship"))
    rel.set("Id", rid)
    rel.set("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image")
    rel.set("Target", target)


def make_table_caption(text: str) -> ET.Element:
    return paragraph(text, align="right", italic=True, size="22")


def make_figure_caption(text: str) -> ET.Element:
    return paragraph(text, align="center", italic=True, size="22")


def generate() -> None:
    if not BACKUP.exists():
        shutil.copy2(TARGET, BACKUP)

    old_image_paras, old_rid_target, old_media = old_images_and_rels()

    with zipfile.ZipFile(TARGET, "r") as zin:
        doc = ET.fromstring(zin.read("word/document.xml"))
        body = doc.find(".//w:body", NS)
        rels_root = ET.fromstring(zin.read("word/_rels/document.xml.rels"))
        styles_xml = normalize_styles(zin.read("word/styles.xml"))
        settings_xml = ensure_update_fields(zin.read("word/settings.xml"))

        # Fill the three summary fields on the first sheet without changing the rest of it.
        paras = [p for p in body.iter(w("p"))]
        first_texts = [get_text(p) for p in paras[:40]]
        replacements = {
            22: "В ходе практики был актуализирован учебный full-stack проект «БьютиШоп Чили»: сохранена серверная часть на FastAPI, обновлена клиентская часть на Next.js и React, описаны архитектура, база данных, API, пользовательские сценарии, административные функции и результаты тестирования.",
            25: "Практика позволила закрепить навыки интеграции программных модулей, проектирования REST API, работы с базой данных, организации авторизации и переноса интерфейса на современный frontend-стек. Полученные знания и практические навыки соответствуют профессиональным компетенциям модуля ПМ.02.",
            28: "Хотелось бы сохранить практико-ориентированный формат работы, добавить больше промежуточных ревью документации и демонстраций, а также уделять больше времени сравнению разных архитектурных решений на одном учебном проекте.",
        }
        for idx, text in replacements.items():
            if idx < len(paras) and ("___" in first_texts[idx] or not first_texts[idx]):
                set_paragraph_text(paras[idx], text, size="22")
                set_alignment(paras[idx], "both")

        # Replace the static table of contents with a Word TOC field.
        children = list(body)
        toc_idx = next((i for i, c in enumerate(children) if c.tag == w("p") and get_text(c) == "Оглавление"), None)
        if toc_idx is not None:
            remove = []
            for j in range(toc_idx + 1, len(children)):
                child = children[j]
                if child.tag == w("p") and get_text(child) == "1. Описание профильной организации (для производственной практики)":
                    break
                if child.tag == w("p"):
                    remove.append(child)
            for child in remove:
                body.remove(child)
            children = list(body)
            toc_idx = children.index(next(c for c in children if c.tag == w("p") and get_text(c) == "Оглавление"))
            body.insert(toc_idx + 1, make_toc_field())

        # Add old illustrations above the corresponding current captions.
        children = list(body)
        existing_media_names = {name for name in zin.namelist() if name.startswith("word/media/")}
        rid_counter = next_rid(rels_root)
        image_idx = 0
        files_to_add: dict[str, bytes] = {}
        for child in list(children):
            if child.tag != w("p"):
                continue
            text = get_text(child)
            match = re.match(r"Рисунок\s+(\d+)[:.]\s*(.+)", text)
            if not match or image_idx >= len(old_image_paras):
                continue
            fig_num, caption = match.groups()
            set_paragraph_text(child, f"Рисунок {fig_num}. {caption}", italic=True, size="22")
            set_alignment(child, "center")
            old_para = old_image_paras[image_idx]
            rid_map: dict[str, str] = {}
            for blip in old_para.findall(".//a:blip", NS):
                old_rid = blip.get(qn("r", "embed"))
                target = old_rid_target.get(old_rid)
                if not target:
                    continue
                source_name = f"word/{target}"
                ext = Path(source_name).suffix or ".png"
                new_media = f"word/media/imported_figure_{fig_num}{ext}"
                public_target = f"media/imported_figure_{fig_num}{ext}"
                if new_media not in existing_media_names:
                    files_to_add[new_media] = old_media[source_name]
                    existing_media_names.add(new_media)
                new_rid = f"rId{rid_counter}"
                rid_counter += 1
                add_rel(rels_root, new_rid, public_target)
                rid_map[old_rid] = new_rid
            body.insert(list(body).index(child), remap_image_paragraph(old_para, rid_map))
            image_idx += 1

        # Number table captions above each table.
        table_titles = [
            "Таблица 1. Описание основных таблиц базы данных",
            "Таблица 2. Основные API-эндпоинты проекта",
            "Таблица 3. Результаты тестирования ключевых сценариев",
        ]
        table_no = 0
        for child in list(body):
            if child.tag == w("tbl") and table_no < len(table_titles):
                prev_idx = list(body).index(child) - 1
                prev_text = get_text(list(body)[prev_idx]) if prev_idx >= 0 and list(body)[prev_idx].tag == w("p") else ""
                if not prev_text.startswith("Таблица "):
                    body.insert(list(body).index(child), make_table_caption(table_titles[table_no]))
                table_no += 1

        # Add more explanatory content to bring the report closer to the previous volume.
        append_expansion_after_heading(body, "2. Анализ предметной области", [
            paragraph("Дополнительно в актуальной версии была уточнена логика пользовательского пути. Главная страница выполняет роль входной витрины, каталог вынесен на отдельный маршрут, а корзина открывается как боковая панель поверх текущего экрана. Такой подход уменьшает количество переходов и делает оформление заказа более быстрым."),
            paragraph("Для интернет-магазина косметики важна не только техническая корректность, но и доверие пользователя к интерфейсу. Поэтому в новой версии акцент сделан на предсказуемых действиях: кнопка добавления сразу открывает корзину, история заказов доступна после входа, а административные функции отделены от покупательских страниц."),
            paragraph("С точки зрения сопровождения предметной области важно, что каталог, заказы и пользователи не завязаны на конкретную реализацию frontend. Backend предоставляет стабильный набор JSON-эндпоинтов, поэтому клиентскую часть можно развивать отдельно, не меняя модель данных при каждом изменении интерфейса."),
        ])
        append_expansion_after_heading(body, "3.1 Архитектурный подход", [
            paragraph("Дополнительно в актуальной версии архитектура стала более модульной на уровне клиента. Если старая версия концентрировала большую часть интерфейсной логики в одном JavaScript-приложении, то новая версия разделяет маршруты, страницы, общие компоненты и бизнес-действия. Это упрощает поиск ошибок и добавление новых экранов."),
            paragraph("Использование Next.js также улучшает структуру навигации. Пути /catalog, /orders, /auth и /admin отражают реальные разделы системы, а компонент ShopApp выбирает нужный экран на основе текущего pathname. Благодаря этому пользовательский интерфейс становится ближе к полноценному веб-приложению, а не только к демонстрационной SPA-странице."),
        ])
        append_expansion_after_heading(body, "4.3 Реализация backend", [
            paragraph("Дополнительно стоит отметить, что backend разделен на тематические маршруты. Такой подход облегчает сопровождение: логика авторизации находится отдельно от каталога, корзина отдельно от заказов, а административные операции не смешиваются с публичными пользовательскими endpoint."),
            paragraph("Валидация входных данных выполняется через Pydantic-схемы. Это особенно важно для операций регистрации, оформления заказа, добавления товара и смены статуса, потому что ошибка в этих данных напрямую влияет на состояние базы. Схемы позволяют заранее ограничить формат запроса и вернуть понятную ошибку клиенту."),
            paragraph("Сервис сериализации преобразует ORM-объекты в удобный для frontend формат. Например, товар возвращается вместе с категорией, брендом и изображением, а заказ содержит позиции и текущий статус. Это снижает количество дополнительных запросов со стороны клиента."),
        ])
        append_expansion_after_heading(body, "4.4 Реализация frontend на Next.js", [
            paragraph("Дополнительно в новой клиентской части была выделена единая точка прикладного состояния. Hook useShopApp отвечает за загрузку каталога, метаданных, корзины, заказов и административных данных. Компоненты получают готовые функции и данные через props, поэтому сами остаются сравнительно простыми."),
            paragraph("Компонент StoreLayout формирует общий каркас витрины: навигацию, переключение языка, состояние пользователя и подключение боковой корзины. Благодаря этому страницы каталога и заказов не дублируют общую разметку и ведут себя единообразно."),
            paragraph("Административная панель построена как рабочий интерфейс с таблицами. Товар можно редактировать прямо в строке таблицы, для заказов доступен выпадающий список статусов, а пользователи отображаются с ролью и активностью. Это делает административный сценарий компактным и практичным для демонстрации."),
        ])
        append_expansion_after_heading(body, "5.1 Подход к тестированию", [
            paragraph("Дополнительно проверялись сценарии повторного открытия приложения после входа. Токены сохраняются в localStorage, поэтому пользователь может обновить страницу и продолжить работу без повторной авторизации, если токен остается действительным."),
            paragraph("Отдельное внимание уделялось ошибочным ситуациям: попытке добавить товар без авторизации, оформлению пустой корзины, входу с неверным паролем и доступу к административной панели без роли admin. Такие проверки важны, потому что они демонстрируют не только успешные, но и защитные ветви логики."),
        ])

        # Make non-title-page body text justified, while keeping figures and table captions aligned as requested.
        seen_paras = 0
        for child in list(body):
            if child.tag != w("p"):
                continue
            text = get_text(child)
            if seen_paras >= 34:
                if text.startswith("Рисунок "):
                    set_alignment(child, "center")
                elif text.startswith("Таблица "):
                    set_alignment(child, "right")
                elif child.findall(".//w:drawing", NS):
                    set_alignment(child, "center")
                elif text.startswith("Листинг "):
                    set_alignment(child, "both")
                else:
                    set_alignment(child, "both")
            seen_paras += 1

        # Apply Times New Roman directly to document runs as well.
        for r in doc.findall(".//w:r", NS):
            rpr = r.find(w("rPr"))
            if rpr is None:
                rpr = ET.Element(w("rPr"))
                r.insert(0, rpr)
            set_times_rpr(rpr)

        document_xml = ET.tostring(doc, encoding="utf-8", xml_declaration=True)
        rels_xml = ET.tostring(rels_root, encoding="utf-8", xml_declaration=True)

        temp = TARGET.with_suffix(".tmp.docx")
        with zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            written = set()
            for info in zin.infolist():
                data = zin.read(info.filename)
                if info.filename == "word/document.xml":
                    data = document_xml
                elif info.filename == "word/_rels/document.xml.rels":
                    data = rels_xml
                elif info.filename == "word/styles.xml":
                    data = styles_xml
                elif info.filename == "word/settings.xml":
                    data = settings_xml
                zout.writestr(info, data)
                written.add(info.filename)
            for name, data in files_to_add.items():
                if name not in written:
                    zout.writestr(name, data)

    try:
        temp.replace(TARGET)
        result = TARGET
    except PermissionError:
        temp.replace(FALLBACK)
        result = FALLBACK
    print(result)
    print(BACKUP)


if __name__ == "__main__":
    generate()
