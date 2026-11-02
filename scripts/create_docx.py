import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def create_tdd_docx():
    doc = Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    with open("TECHNICAL_DESIGN_DOCUMENT.md", "r", encoding="utf-8") as f:
        md_text = f.read()

    lines = md_text.split('\n')
    
    in_table = False
    table_rows = []

    for line in lines:
        line_stripped = line.strip()

        # Handle tables
        if line_stripped.startswith('|') and line_stripped.endswith('|'):
            if '---' in line_stripped:
                continue # Skip markdown separator row
            in_table = True
            cells = [c.strip() for c in line_stripped.split('|')[1:-1]]
            table_rows.append(cells)
            continue
        elif in_table:
            # End of table, render it
            if table_rows:
                num_cols = max(len(r) for r in table_rows)
                t = doc.add_table(rows=len(table_rows), cols=num_cols)
                t.alignment = WD_TABLE_ALIGNMENT.CENTER
                for r_idx, row_data in enumerate(table_rows):
                    for c_idx, cell_data in enumerate(row_data):
                        if c_idx < num_cols:
                            cell = t.cell(r_idx, c_idx)
                            cell.text = cell_data
                            # Style header
                            if r_idx == 0:
                                set_cell_background(cell, "0F766E")
                                for p in cell.paragraphs:
                                    for run in p.runs:
                                        run.font.bold = True
                                        run.font.color.rgb = RGBColor(255, 255, 255)
                                        run.font.size = Pt(9.5)
                            else:
                                if r_idx % 2 == 1:
                                    set_cell_background(cell, "F8FAFC")
                                for p in cell.paragraphs:
                                    for run in p.runs:
                                        run.font.size = Pt(9)
                doc.add_paragraph() # spacing
            in_table = False
            table_rows = []

        # Empty lines
        if not line_stripped:
            continue

        # Header 1
        if line_stripped.startswith('# '):
            h = doc.add_heading(line_stripped[2:], level=1)
            h.style.font.name = 'Calibri'
            h.style.font.color.rgb = RGBColor(15, 118, 110)
            h.style.font.size = Pt(22)
            continue

        # Header 2
        if line_stripped.startswith('## '):
            h = doc.add_heading(line_stripped[3:], level=2)
            h.style.font.name = 'Calibri'
            h.style.font.color.rgb = RGBColor(19, 78, 74)
            h.style.font.size = Pt(16)
            continue

        # Header 3
        if line_stripped.startswith('### '):
            h = doc.add_heading(line_stripped[4:], level=3)
            h.style.font.name = 'Calibri'
            h.style.font.color.rgb = RGBColor(30, 41, 59)
            h.style.font.size = Pt(13)
            continue

        # Bullet items
        if line_stripped.startswith('- ') or line_stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            text = line_stripped[2:]
            # parse bold
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                else:
                    p.add_run(part)
            p.paragraph_format.line_spacing = 1.15
            continue

        # Code block marker
        if line_stripped.startswith('```'):
            continue

        # Numbered list
        if re.match(r'^\d+\.\s', line_stripped):
            p = doc.add_paragraph(style='List Number')
            text = re.sub(r'^\d+\.\s', '', line_stripped)
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                else:
                    p.add_run(part)
            p.paragraph_format.line_spacing = 1.15
            continue

        # Regular Paragraph
        p = doc.add_paragraph()
        parts = re.split(r'(\*\*.*?\*\*)', line_stripped)
        for part in parts:
            if part.startswith('**') and part.endswith('**'):
                run = p.add_run(part[2:-2])
                run.bold = True
            else:
                p.add_run(part)
        p.paragraph_format.line_spacing = 1.15
        p.style.font.size = Pt(10)
        p.style.font.name = 'Calibri'

    doc.save("Technical_Design_Document.docx")
    print("Technical_Design_Document.docx created successfully!")

if __name__ == "__main__":
    create_tdd_docx()
