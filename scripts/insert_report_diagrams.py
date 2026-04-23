import copy
import math
import struct
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture"
REL_PKG = "http://schemas.openxmlformats.org/package/2006/relationships"
ET.register_namespace("w", W)
ET.register_namespace("r", R)
ET.register_namespace("a", A)
ET.register_namespace("wp", WP)
ET.register_namespace("pic", PIC)


def w(tag: str) -> str:
    return f"{{{W}}}{tag}"


def r(tag: str) -> str:
    return f"{{{R}}}{tag}"


def a(tag: str) -> str:
    return f"{{{A}}}{tag}"


def wp(tag: str) -> str:
    return f"{{{WP}}}{tag}"


def pic(tag: str) -> str:
    return f"{{{PIC}}}{tag}"


def get_png_size(path: Path) -> tuple[int, int]:
    with path.open("rb") as f:
        sig = f.read(24)
    if sig[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Unsupported image format: {path}")
    width, height = struct.unpack(">II", sig[16:24])
    return width, height


def make_run(text: str, *, center: bool = False, bold: bool = False, color: str | None = None, size: int = 24) -> ET.Element:
    p = ET.Element(w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    spacing = ET.SubElement(ppr, w("spacing"))
    spacing.set(w("before"), "0")
    spacing.set(w("after"), "120")
    spacing.set(w("line"), "240")
    spacing.set(w("lineRule"), "auto")
    if center:
        jc = ET.SubElement(ppr, w("jc"))
        jc.set(w("val"), "center")
    r_el = ET.SubElement(p, w("r"))
    rpr = ET.SubElement(r_el, w("rPr"))
    fonts = ET.SubElement(rpr, w("rFonts"))
    for key in ("ascii", "hAnsi", "eastAsia", "cs"):
        fonts.set(w(key), "Times New Roman")
    if bold:
        ET.SubElement(rpr, w("b"))
        ET.SubElement(rpr, w("bCs"))
    if color:
        col = ET.SubElement(rpr, w("color"))
        col.set(w("val"), color)
    sz = ET.SubElement(rpr, w("sz"))
    sz.set(w("val"), str(size))
    szcs = ET.SubElement(rpr, w("szCs"))
    szcs.set(w("val"), str(size))
    t = ET.SubElement(r_el, w("t"))
    t.text = text
    return p


def make_paragraph(text: str = "", *, center: bool = False, first_line_twips: int = 0) -> ET.Element:
    p = ET.Element(w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    spacing = ET.SubElement(ppr, w("spacing"))
    spacing.set(w("before"), "0")
    spacing.set(w("after"), "120")
    spacing.set(w("line"), "240")
    spacing.set(w("lineRule"), "auto")
    ind = ET.SubElement(ppr, w("ind"))
    ind.set(w("firstLine"), str(first_line_twips))
    if center:
        jc = ET.SubElement(ppr, w("jc"))
        jc.set(w("val"), "center")
    if text:
        r_el = ET.SubElement(p, w("r"))
        t = ET.SubElement(r_el, w("t"))
        t.text = text
    return p


def make_image_paragraph(rel_id: str, name: str, width_px: int, height_px: int, docpr_id: int) -> ET.Element:
    max_width_emu = 5.5 * 914400
    emu_per_px = 9525
    width_emu = width_px * emu_per_px
    height_emu = height_px * emu_per_px
    if width_emu > max_width_emu:
        scale = max_width_emu / width_emu
        width_emu = int(width_emu * scale)
        height_emu = int(height_emu * scale)

    p = ET.Element(w("p"))
    ppr = ET.SubElement(p, w("pPr"))
    spacing = ET.SubElement(ppr, w("spacing"))
    spacing.set(w("before"), "0")
    spacing.set(w("after"), "120")
    spacing.set(w("line"), "240")
    spacing.set(w("lineRule"), "auto")
    jc = ET.SubElement(ppr, w("jc"))
    jc.set(w("val"), "center")

    r_el = ET.SubElement(p, w("r"))
    drawing = ET.SubElement(r_el, w("drawing"))
    inline = ET.SubElement(drawing, wp("inline"))
    extent = ET.SubElement(inline, wp("extent"))
    extent.set("cx", str(width_emu))
    extent.set("cy", str(height_emu))
    ET.SubElement(inline, wp("effectExtent"), {"l": "0", "t": "0", "r": "0", "b": "0"})
    docpr = ET.SubElement(inline, wp("docPr"))
    docpr.set("id", str(docpr_id))
    docpr.set("name", name)
    c_nv = ET.SubElement(inline, wp("cNvGraphicFramePr"))
    ET.SubElement(c_nv, a("graphicFrameLocks"), {"noChangeAspect": "1"})
    graphic = ET.SubElement(inline, a("graphic"))
    graphic_data = ET.SubElement(graphic, a("graphicData"))
    graphic_data.set("uri", PIC)
    pic_el = ET.SubElement(graphic_data, pic("pic"))
    nv_pic = ET.SubElement(pic_el, pic("nvPicPr"))
    c_nv_pr = ET.SubElement(nv_pic, pic("cNvPr"))
    c_nv_pr.set("id", "0")
    c_nv_pr.set("name", name)
    ET.SubElement(nv_pic, pic("cNvPicPr"))
    blip_fill = ET.SubElement(pic_el, pic("blipFill"))
    ET.SubElement(blip_fill, a("blip"), {r("embed"): rel_id})
    stretch = ET.SubElement(blip_fill, a("stretch"))
    ET.SubElement(stretch, a("fillRect"))
    sp_pr = ET.SubElement(pic_el, pic("spPr"))
    xfrm = ET.SubElement(sp_pr, a("xfrm"))
    ET.SubElement(xfrm, a("off"), {"x": "0", "y": "0"})
    ET.SubElement(xfrm, a("ext"), {"cx": str(width_emu), "cy": str(height_emu)})
    prst = ET.SubElement(sp_pr, a("prstGeom"))
    prst.set("prst", "rect")
    ET.SubElement(prst, a("avLst"))
    return p


def ensure_png_content_type(root: ET.Element) -> None:
    exists = False
    for child in root:
        if child.tag.endswith("Default") and child.get("Extension") == "png":
            exists = True
            break
    if not exists:
        ET.SubElement(root, "Default", {"Extension": "png", "ContentType": "image/png"})


def main() -> None:
    docx_path = Path(r"docs/documentation/ОТЧЕТ_УП.docx")
    assets = Path(r"docs/documentation/diagrams_assets")
    tmp_path = docx_path.with_suffix(".images.tmp.docx")

    uml_items = [
        (assets / "forUML-diagrams" / "Use-Case.png", "Диаграмма вариантов использования"),
        (assets / "forUML-diagrams" / "Component.png", "Диаграмма компонентов"),
        (assets / "forUML-diagrams" / "registration.png", "Диаграмма последовательности регистрации пользователя"),
        (assets / "forUML-diagrams" / "JWT-auth.png", "Диаграмма последовательности авторизации JWT"),
        (assets / "forUML-diagrams" / "catalog.png", "Диаграмма последовательности просмотра каталога"),
        (assets / "forUML-diagrams" / "cart.png", "Диаграмма последовательности добавления товара в корзину"),
        (assets / "forUML-diagrams" / "checkout.png", "Диаграмма последовательности оформления заказа"),
    ]
    erd_items = [
        (assets / "forDB-diagrams" / "ERD.png", "ER-диаграмма базы данных"),
    ]

    uml_placeholder = "ВСТАВИТЬ UML-ДИАГРАММЫ ИЗ docs/usecase-diagram.drawio, docs/component-diagram.drawio И tasks/3_Diagramms/seq-*.puml"
    erd_placeholder = "ВСТАВИТЬ ER-ДИАГРАММУ БАЗЫ ДАННЫХ ИЗ docs/DBdocs/diagrams/ ИЛИ tasks/4_ERD for db/ERM.drawio"

    with zipfile.ZipFile(docx_path, "r") as zin:
        doc_root = ET.fromstring(zin.read("word/document.xml"))
        rels_root = ET.fromstring(zin.read("word/_rels/document.xml.rels"))
        content_types_root = ET.fromstring(zin.read("[Content_Types].xml"))

        ensure_png_content_type(content_types_root)

        body = doc_root.find(w("body"))
        assert body is not None
        paragraphs = body.findall(w("p"))

        existing_rel_ids = []
        for rel in rels_root:
            rid = rel.get("Id")
            if rid and rid.startswith("rId"):
                try:
                    existing_rel_ids.append(int(rid[3:]))
                except ValueError:
                    pass
        next_rel_id = max(existing_rel_ids or [0]) + 1
        docpr_id = 1
        figure_num = 1
        media_entries: list[tuple[str, bytes]] = []

        def insert_for_placeholder(placeholder: str, items: list[tuple[Path, str]]) -> None:
            nonlocal next_rel_id, docpr_id, figure_num
            for idx, p in enumerate(paragraphs):
                text = "".join(t.text or "" for t in p.findall(f".//{w('t')}")).strip()
                if text != placeholder:
                    continue
                insert_index = list(body).index(p)
                body.remove(p)
                for image_path, title in items:
                    media_name = f"image_report_{figure_num}.png"
                    rel_id = f"rId{next_rel_id}"
                    next_rel_id += 1
                    ET.SubElement(
                        rels_root,
                        "Relationship",
                        {
                            "Id": rel_id,
                            "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                            "Target": f"media/{media_name}",
                        },
                    )
                    media_entries.append((f"word/media/{media_name}", image_path.read_bytes()))
                    width, height = get_png_size(image_path)
                    body.insert(insert_index, make_image_paragraph(rel_id, media_name, width, height, docpr_id))
                    insert_index += 1
                    docpr_id += 1
                    caption = f"Рисунок {figure_num}: {title}"
                    body.insert(insert_index, make_run(caption, center=True, size=24))
                    insert_index += 1
                    body.insert(insert_index, make_paragraph("", first_line_twips=0))
                    insert_index += 1
                    figure_num += 1
                return
            raise ValueError(f"Placeholder not found: {placeholder}")

        insert_for_placeholder(uml_placeholder, uml_items)
        insert_for_placeholder(erd_placeholder, erd_items)

        new_doc = ET.tostring(doc_root, encoding="utf-8", xml_declaration=True)
        new_rels = ET.tostring(rels_root, encoding="utf-8", xml_declaration=True)
        new_types = ET.tostring(content_types_root, encoding="utf-8", xml_declaration=True)

        with zipfile.ZipFile(tmp_path, "w") as zout:
            written_media = {name for name, _ in media_entries}
            for item in zin.infolist():
                if item.filename == "word/document.xml":
                    zout.writestr(item, new_doc)
                elif item.filename == "word/_rels/document.xml.rels":
                    zout.writestr(item, new_rels)
                elif item.filename == "[Content_Types].xml":
                    zout.writestr(item, new_types)
                else:
                    zout.writestr(item, zin.read(item.filename))
            for name, data in media_entries:
                zout.writestr(name, data)

    tmp_path.replace(docx_path)


if __name__ == "__main__":
    main()
