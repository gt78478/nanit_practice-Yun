from __future__ import annotations

import shutil
import zipfile
from copy import deepcopy
from pathlib import Path
from xml.etree import ElementTree as ET


BASE_DIR = Path(__file__).resolve().parent
TARGET = BASE_DIR / "Аттестационный лист.docx"
BACKUP = BASE_DIR / "Аттестационный лист.backup-before-fill.docx"
FALLBACK = BASE_DIR / "Аттестационный лист заполненный.docx"

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "xml": "http://www.w3.org/XML/1998/namespace",
}
ET.register_namespace("w", NS["w"])


def w(tag: str) -> str:
    return f"{{{NS['w']}}}{tag}"


def set_cell_text(cell: ET.Element, text: str, *, center: bool = False) -> None:
    tc_pr = cell.find(w("tcPr"))
    saved_pr = deepcopy(tc_pr) if tc_pr is not None else None
    for child in list(cell):
        cell.remove(child)
    if saved_pr is not None:
        cell.append(saved_pr)

    p = ET.SubElement(cell, w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    jc = ET.SubElement(ppr, w("jc"))
    jc.set(w("val"), "center" if center else "both")

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
    rows_data = [
        (
            "1",
            "Анализ предметной области интернет-магазина косметики, изучение требований к проекту, определение ролей пользователей, основных сценариев и структуры программного модуля.",
            "Работа выполнена в полном объеме. Требования проанализированы, предметная область описана, основные пользовательские и административные сценарии определены корректно.",
        ),
        (
            "2",
            "Проектирование архитектуры приложения и базы данных: выделение frontend, backend и уровня хранения данных, описание сущностей каталога, корзины, заказов, платежей и пользователей.",
            "Работа выполнена качественно. Архитектура соответствует задачам проекта, структура данных отражает основные бизнес-объекты и связи интернет-магазина.",
        ),
        (
            "3",
            "Разработка и актуализация программного модуля: реализация backend на FastAPI, REST API, JWT-авторизации, пользовательских сценариев, а также перенос клиентской части на Next.js и React.",
            "Работа выполнена в соответствии с требованиями. Основные функции проекта реализованы, frontend и backend интегрированы, административные и пользовательские разделы работоспособны.",
        ),
        (
            "4",
            "Тестирование ключевых сценариев, проверка запуска проекта, подготовка отчетной документации, дневника практики, диаграмм, таблиц и описания результатов разработки.",
            "Работа выполнена в полном объеме. Проведена проверка основных сценариев, результаты оформлены в отчетных материалах, документация соответствует содержанию выполненной практики.",
        ),
    ]

    if not BACKUP.exists():
        shutil.copy2(TARGET, BACKUP)

    with zipfile.ZipFile(TARGET, "r") as zin:
        document = ET.fromstring(zin.read("word/document.xml"))
        tables = document.findall(".//w:tbl", NS)
        if not tables:
            raise RuntimeError("Не найдена таблица аттестационного листа")
        table = tables[0]
        rows = table.findall("./w:tr", NS)
        if len(rows) < 2:
            raise RuntimeError("В таблице нет строк для заполнения")

        template = deepcopy(rows[1])
        for row in rows[1:]:
            table.remove(row)

        for number, task, quality in rows_data:
            row = deepcopy(template)
            cells = row.findall("./w:tc", NS)
            while len(cells) < 3:
                row.append(deepcopy(cells[-1]))
                cells = row.findall("./w:tc", NS)
            set_cell_text(cells[0], number, center=True)
            set_cell_text(cells[1], task)
            set_cell_text(cells[2], quality)
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
