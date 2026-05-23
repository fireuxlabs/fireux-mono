from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(".")
OUTPUT = ROOT / "output/pdf/yellow-velo-terms-and-agreements.pdf"
TMP = ROOT / "tmp/pdfs/yellow-velo-cleaned"

SOURCES = [
    {
        "path": Path("/Users/danielwatson/Downloads/yv(1).jpeg"),
        "out": TMP / "01-rental-terms.jpg",
        "crop": (500, 120, 4120, 5540),
    },
    {
        "path": Path("/Users/danielwatson/Downloads/yv2.jpeg"),
        "out": TMP / "02-tour-participant-agreement.jpg",
        "crop": (430, 30, 4140, 5520),
    },
]


def prepare_image(source):
    image = Image.open(source["path"]).convert("RGB")
    image = image.rotate(-90, expand=True)
    image = image.crop(source["crop"])
    image = ImageOps.autocontrast(image, cutoff=1)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Sharpness(image).enhance(1.2)
    source["out"].parent.mkdir(parents=True, exist_ok=True)
    image.save(source["out"], quality=92, optimize=True)
    return source["out"]


def draw_fit_page(pdf, image_path):
    page_width, page_height = A4
    image = Image.open(image_path)
    image_width, image_height = image.size
    image_ratio = image_width / image_height
    page_ratio = page_width / page_height

    if image_ratio > page_ratio:
        draw_width = page_width
        draw_height = draw_width / image_ratio
    else:
        draw_height = page_height
        draw_width = draw_height * image_ratio

    x = (page_width - draw_width) / 2
    y = (page_height - draw_height) / 2
    pdf.drawImage(str(image_path), x, y, width=draw_width, height=draw_height)
    pdf.showPage()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    prepared = [prepare_image(source) for source in SOURCES]
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4)
    for image_path in prepared:
        draw_fit_page(pdf, image_path)
    pdf.save()


if __name__ == "__main__":
    build()
