# Brand asset brief

Use this brief when commissioning or approving App identity assets for FireUX.
The artwork is the identity; PNG, SVG, light, and dark are exports of that one
identity. A file format never authorizes a redesign.

## Non-negotiable identity rule

Choose and name one approved visual master before producing variants. Every
wordmark export must preserve its geometry exactly:

- identical letterforms, symbols, spacing, proportions, and composition;
- identical canvas ratio, placement, visible bounds, and safe padding;
- no cropping or visible content touching a canvas edge;
- light and dark variants change colour or surface treatment only;
- raster and vector formats must look identical when overlaid at the same size.

Do not recreate an approved wordmark with a similar font. Do not use SVG
`<text>`, a substitute typeface, an approximate trace, or a linked bitmap and
call it a vector master. Convert lettering to faithful outlined paths only
after the approved geometry is locked.

If a faithful outlined SVG is not available, deliver the approved PNGs and
omit the wordmark SVGs. A correct PNG is preferable to a different logo in an
SVG file.

## Required runtime deliverables

| File | Requirement | Purpose |
| --- | --- | --- |
| `logo.png` | Exactly 512×512 PNG | Primary square App identity |
| `wordmark.png` | PNG; same geometry and canvas as both surface variants | Generic approved wordmark |
| `wordmark-light.png` | PNG; at least 256×64 and at least 3:1 | Wordmark intended for a light surface |
| `wordmark-dark.png` | PNG; at least 256×64 and at least 3:1 | Wordmark intended for a dark surface |
| `cover.png` | 16:9 PNG; at least 1280×720 | Wide App cover artwork |
| `thumbnail.png` | Exactly 1200×630 PNG | Sharing and directory preview |
| `favicon.ico` | Square; at least 32×32 | Browser icon |
| `pwa/icon-192.png` | Exactly 192×192 PNG | PWA icon |
| `pwa/icon-512.png` | Exactly 512×512 PNG | PWA icon |

`light` and `dark` name the destination surface, not the colour of the
lettering. A light-surface wordmark normally uses dark lettering; a
dark-surface wordmark normally uses light lettering.

SVG wordmarks are optional. When supplied, they must be genuine outlined
vectors derived from the same approved master. Source files such as AI, EPS,
PDF, Figma exports, or layered originals are welcome in addition to—not in
place of—the runtime PNG family.

## Cover, thumbnail, and square identity

These are different compositions, not interchangeable crops:

- `logo.png` is a square identity mark, not a photograph or wide wordmark;
- `cover.png` is a wide 16:9 composition with important content inside a safe
  central area for responsive cropping;
- `thumbnail.png` is a 1200×630 sharing composition that remains readable at
  small sizes;
- transparent identity artwork needs deliberate padding and must be tested on
  both light and dark backgrounds.

Do not stretch one composition into another aspect ratio. Recompose from the
approved source artwork where necessary.

## Delivery structure

Deliver one ZIP with clear authority and no ambiguous replacements:

```text
brand-name-assets/
  APPROVED-MASTER.md
  runtime/
    logo.png
    wordmark.png
    wordmark-light.png
    wordmark-dark.png
    cover.png
    thumbnail.png
    favicon.ico
    pwa/
      icon-192.png
      icon-512.png
  vector/                 # optional; outlined paths only
  source/                 # AI, EPS, PDF, Figma, layered masters
  extras/                 # signage, social, print, packaging, photography
```

`APPROVED-MASTER.md` must identify the visual master and record any locked
brand-specific geometry, such as the exact number of strokes, relative symbol
position, or required clear space. Alternate concepts must be named
`alternate` and must never use canonical runtime filenames.

## Approval checklist

Before delivery, confirm:

- the approved master is explicitly identified;
- PNG and optional SVG overlays have matching silhouettes and placement;
- all wordmark variants share the same dimensions and visible bounds;
- no variant substitutes a font or changes the logo geometry;
- SVG lettering is outlined and contains no `<text>` or linked raster image;
- transparent artwork has safe padding and no clipped pixels;
- light/dark variants remain legible on their named surfaces;
- required dimensions, formats, filenames, and colour profiles are correct;
- extras and rejected alternatives cannot be mistaken for runtime assets.

Repository authority and implementation details remain in
`docs/concepts/brand-assets.md` and the current App asset requirements source.
