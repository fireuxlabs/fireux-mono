from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = Path("output/pdf/qrdocs-terms-and-how-to-use.pdf")


def styles():
    base = getSampleStyleSheet()
    ink = colors.HexColor("#172033")
    muted = colors.HexColor("#607089")
    purple = colors.HexColor("#5b3df5")
    soft = colors.HexColor("#f6f4ff")

    base.add(ParagraphStyle(
        name="BrandTitle",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=32,
        textColor=ink,
        spaceAfter=4,
    ))
    base.add(ParagraphStyle(
        name="Subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=muted,
        spaceAfter=18,
    ))
    base.add(ParagraphStyle(
        name="Section",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=ink,
        spaceBefore=8,
        spaceAfter=6,
    ))
    base.add(ParagraphStyle(
        name="Body",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=ink,
        spaceAfter=7,
    ))
    base.add(ParagraphStyle(
        name="Small",
        parent=base["Body"],
        fontSize=8,
        leading=11,
        textColor=muted,
    ))
    base.add(ParagraphStyle(
        name="Pill",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=purple,
        backColor=soft,
        borderPadding=(5, 7, 5, 7),
        spaceAfter=12,
    ))
    return base


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = A4
    margin = 16 * mm

    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)

    canvas.setFillColor(colors.HexColor("#5b3df5"))
    canvas.roundRect(margin, height - 19 * mm, 10 * mm, 10 * mm, 2.2 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.drawCentredString(margin + 5 * mm, height - 15.3 * mm, "QR")
    canvas.setFillColor(colors.HexColor("#172033"))
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(margin + 13 * mm, height - 13.7 * mm, "QRdocs")

    canvas.setStrokeColor(colors.HexColor("#dde5ef"))
    canvas.line(margin, 15 * mm, width - margin, 15 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#607089"))
    canvas.drawString(margin, 9 * mm, "QRdocs is part of the FireUX ecosystem.")
    canvas.drawRightString(width - margin, 9 * mm, "qrdocs.web.app")
    canvas.restoreState()


def para(text, style):
    return Paragraph(text, style)


def bullet(text, style):
    return Paragraph(f"&bull; {text}", style)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=28 * mm,
        bottomMargin=22 * mm,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame], onPage=draw_page)])

    s = styles()

    steps = Table(
        [
            [para("<b>1. Upload</b>", s["Body"]), para("Choose a PDF, image, DOC or DOCX file.", s["Body"])],
            [para("<b>2. Name</b>", s["Body"]), para("Choose the public document path, such as <b>my-doc</b>.", s["Body"])],
            [para("<b>3. Create</b>", s["Body"]), para("QRdocs stores the file and creates a public document page.", s["Body"])],
            [para("<b>4. Share</b>", s["Body"]), para("Use the document link or print the QR page.", s["Body"])],
        ],
        colWidths=[37 * mm, 125 * mm],
        hAlign="LEFT",
    )
    steps.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#dfe7f2")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dfe7f2")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))

    story = [
        para("QRdocs", s["BrandTitle"]),
        para("Simple document hosting with a public URL and printable QR code.", s["Subtitle"]),
        para("Proof of concept", s["Pill"]),
        para("What QRdocs Does", s["Section"]),
        para("QRdocs turns a normal document into a simple hosted page and QR code. It is for businesses that already have a document and need customers, guests or visitors to scan it quickly.", s["Body"]),
        bullet("Upload a document.", s["Body"]),
        bullet("Choose a clean public path.", s["Body"]),
        bullet("Get a hosted document page.", s["Body"]),
        bullet("Get a printable QR page.", s["Body"]),
        Spacer(1, 5 * mm),
        para("How To Use QRdocs", s["Section"]),
        steps,
        Spacer(1, 7 * mm),
        para("Terms and Conditions", s["Section"]),
        bullet("QRdocs hosts documents supplied by the user. The user is responsible for making sure they have the right to upload and share the content.", s["Body"]),
        bullet("Documents should not contain private, sensitive or illegal material.", s["Body"]),
        bullet("QRdocs is a lightweight hosting and QR service. It does not provide legal, medical, financial or professional advice.", s["Body"]),
        bullet("The service may remove documents that are unsafe, unlawful, abusive or uploaded by mistake.", s["Body"]),
        bullet("The proof of concept is provided as-is while the product is being tested.", s["Body"]),
        Spacer(1, 5 * mm),
        para("FireUX Ecosystem", s["Section"]),
        para("QRdocs is a standalone product inside the FireUX ecosystem. FireUX provides the shared app shell, hosting patterns, dashboard/admin foundations and reusable product infrastructure. QRdocs focuses only on document hosting and QR sharing.", s["Body"]),
        para("Public document example: https://qrdocs.web.app/docs/qrdocs-terms-and-how-to-use", s["Small"]),
        para("Printable QR example: https://qrdocs.web.app/docs/qrdocs-terms-and-how-to-use/qr", s["Small"]),
    ]

    doc.build(story)


if __name__ == "__main__":
    build()
