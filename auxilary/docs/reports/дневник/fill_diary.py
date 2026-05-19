from __future__ import annotations

import shutil
import zipfile
from copy import deepcopy
from pathlib import Path
from xml.etree import ElementTree as ET


BASE_DIR = Path(__file__).resolve().parent
TARGET = BASE_DIR / "Дневник.docx"
BACKUP = BASE_DIR / "Дневник.backup-before-fill.docx"
FALLBACK = BASE_DIR / "Дневник заполненный.docx"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "xml": "http://www.w3.org/XML/1998/namespace",
}
ET.register_namespace("w", NS["w"])


def w(tag: str) -> str:
    return f"{{{NS['w']}}}{tag}"


def get_text(cell: ET.Element) -> str:
    return "".join((t.text or "") for t in cell.findall(".//w:t", NS)).strip()


def set_cell_text(cell: ET.Element, text: str) -> None:
    tc_pr = cell.find(w("tcPr"))
    saved_pr = deepcopy(tc_pr) if tc_pr is not None else None
    for child in list(cell):
        cell.remove(child)
    if saved_pr is not None:
        cell.append(saved_pr)

    p = ET.SubElement(cell, w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    jc = ET.SubElement(ppr, w("jc"))
    jc.set(w("val"), "center" if text in {"Выполнено"} or text.count(".") == 2 else "both")

    r = ET.SubElement(p, w("r"))
    rpr = ET.SubElement(r, w("rPr"))
    rfonts = ET.SubElement(rpr, w("rFonts"))
    for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
        rfonts.set(w(attr), "Times New Roman")
    sz = ET.SubElement(rpr, w("sz"))
    sz.set(w("val"), "22")
    szcs = ET.SubElement(rpr, w("szCs"))
    szcs.set(w("val"), "22")
    t = ET.SubElement(r, w("t"))
    t.set(f"{{{NS['xml']}}}space", "preserve")
    t.text = text


def fill() -> None:
    entries = [
        ("04.05.2026", "Ознакомление с заданием практики, структурой учебного проекта и требованиями к отчетной документации. Анализ текущего состояния проекта «БьютиШоп Чили»."),
        ("05.05.2026", "Анализ предметной области интернет-магазина косметики, определение ролей пользователей, основных сценариев покупателя и администратора."),
        ("06.05.2026", "Проектирование архитектуры программного модуля: разделение frontend, backend и базы данных, описание взаимодействия компонентов через REST API."),
        ("07.05.2026", "Проектирование структуры базы данных, уточнение основных сущностей: пользователи, товары, категории, бренды, корзина, заказы, платежи и отзывы."),
        ("08.05.2026", "Анализ и актуализация backend-части на FastAPI: маршруты авторизации, каталога, пользователей и общие схемы данных."),
        ("12.05.2026", "Разработка и проверка серверной логики корзины, оформления заказов, создания демонстрационного платежа и истории статусов заказа."),
        ("13.05.2026", "Перенос клиентской части на Next.js и React, настройка структуры frontend-next, маршрутов приложения, общего layout и точки входа ShopApp."),
        ("14.05.2026", "Реализация пользовательских экранов: главная витрина, каталог с фильтрами, авторизация, боковая корзина и форма оформления заказа."),
        ("15.05.2026", "Реализация административной панели: dashboard, управление товарами, просмотр пользователей, список заказов и изменение статусов."),
        ("18.05.2026", "Тестирование основных пользовательских и административных сценариев, проверка интеграции frontend-next с backend и запуска через Docker Compose."),
        ("19.05.2026", "Подготовка и оформление отчетных материалов по практике: описание проекта, таблицы, рисунки, листинги кода, выводы и заполнение дневника практики."),
    ]

    if not BACKUP.exists():
        shutil.copy2(TARGET, BACKUP)

    with zipfile.ZipFile(TARGET, "r") as zin:
        document = ET.fromstring(zin.read("word/document.xml"))
        tables = document.findall(".//w:tbl", NS)
        if len(tables) < 2:
            raise RuntimeError("Не найдена таблица дневника")

        table = tables[1]
        rows = table.findall("./w:tr", NS)
        header = deepcopy(rows[0])
        template = deepcopy(rows[1]) if len(rows) > 1 else deepcopy(header)

        for row in list(table.findall("./w:tr", NS)):
            table.remove(row)
        table.append(header)

        for date, content in entries:
            row = deepcopy(template)
            cells = row.findall("./w:tc", NS)
            while len(cells) < 4:
                row.append(deepcopy(cells[-1]))
                cells = row.findall("./w:tc", NS)
            set_cell_text(cells[0], date)
            set_cell_text(cells[1], content)
            set_cell_text(cells[2], "Выполнено")
            set_cell_text(cells[3], "")
            table.append(row)

        document_xml = ET.tostring(document, encoding="utf-8", xml_declaration=True)

        temp = TARGET.with_suffix(".tmp.docx")
        with zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "word/document.xml":
                    data = document_xml
                zout.writestr(item, data)

    try:
        temp.replace(TARGET)
        result = TARGET
    except PermissionError:
        temp.replace(FALLBACK)
        result = FALLBACK

    print(result)
    print(BACKUP)


if __name__ == "__main__":
    fill()
