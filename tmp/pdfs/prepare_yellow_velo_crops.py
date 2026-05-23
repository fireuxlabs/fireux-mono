from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance

TMP = Path("tmp/pdfs/yellow-velo-reference")
TMP.mkdir(parents=True, exist_ok=True)

sources = {
    "rental": Path("/Users/danielwatson/Downloads/yv(1).jpeg"),
    "tour": Path("/Users/danielwatson/Downloads/yv2.jpeg"),
}

for name, path in sources.items():
    image = Image.open(path).convert("RGB").rotate(-90, expand=True)
    image = ImageOps.autocontrast(image, cutoff=1)
    image = ImageEnhance.Sharpness(image).enhance(1.15)
    image.save(TMP / f"{name}-rotated.jpg", quality=92)

    width, height = image.size
    crops = {
        "top": (0, 0, width, int(height * 0.28)),
        "middle": (0, int(height * 0.23), width, int(height * 0.66)),
        "bottom": (0, int(height * 0.57), width, height),
        "logo": (int(width * 0.72), 0, width, int(height * 0.23)),
    }
    for crop_name, box in crops.items():
        image.crop(box).save(TMP / f"{name}-{crop_name}.jpg", quality=95)
