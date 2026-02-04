from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from datetime import datetime


def generate_pod_pdf(record):
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        alignment=1
    )

    story = []
    story.append(Paragraph("POD - Leveringskvittering", title_style))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"<b>Sags nr:</b> {record.case_number}", styles['Normal']))
    story.append(Paragraph(f"<b>Chauffør/Pakkemester:</b> {record.driver_name}", styles['Normal']))
    story.append(Paragraph(f"<b>Formand:</b> {record.foreman_name or ''}", styles['Normal']))
    story.append(Paragraph(f"<b>Kunde:</b> {record.customer_name or ''}", styles['Normal']))
    story.append(Paragraph(f"<b>Noter:</b> {record.notes or ''}", styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"<b>Billeder:</b> {record.photo_paths or ''}", styles['Normal']))
    story.append(Paragraph(f"<b>Signatur:</b> {record.signature_path or ''}", styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"Genereret: {datetime.now().strftime('%d-%m-%Y %H:%M')}", styles['Normal']))

    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer
