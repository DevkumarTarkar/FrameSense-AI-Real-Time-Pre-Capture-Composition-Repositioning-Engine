import docx

doc = docx.Document(r'D:\FrameSense-AI\FrameSense_AI_Phase1_Project_Report.docx')
lines = []

for block in doc.element.body:
    if block.tag.endswith('p'):
        p = docx.text.paragraph.Paragraph(block, doc)
        txt = p.text.strip()
        if txt:
            lines.append(txt)
    elif block.tag.endswith('tbl'):
        t = docx.table.Table(block, doc)
        rows_str = []
        for i, row in enumerate(t.rows):
            cells = [c.text.replace('\n', ' ').strip() for c in row.cells]
            rows_str.append('| ' + ' | '.join(cells) + ' |')
            if i == 0:
                rows_str.append('| ' + ' | '.join(['---'] * len(cells)) + ' |')
        if rows_str:
            lines.append('\n'.join(rows_str))

with open(r'D:\FrameSense-AI\FrameSense_AI_Phase1_Project_Report.md', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(lines))

print('SUCCESS: Markdown extracted and synchronized!')
