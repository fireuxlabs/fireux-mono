# Original activity photography

These are untouched copies of the operator photographs attributed by the client
to her husband. They are photographic masters for the current web development
pass, not replacement or generated imagery. Source URLs, SHA-256 hashes and
per-image development settings are in `development.json`.

Development order: apply EXIF orientation; convert to sRGB; adjust brightness and
saturation; apply the recorded linear contrast; apply the recorded restrained
Sharp luminance sharpening; resize to 500/750/1000 pixels without enlargement;
encode WebP at quality 92 and effort 6. AVIF delivery equivalents use quality 65, effort 6 and 4:4:4 chroma; native picture selection retains WebP fallback. Preserve all scene content, people,
equipment, signatures and watermarks. No generative reconstruction or outpainting
is part of this process. Ratios and display crops belong to the consuming card
and header CSS and do not modify these masters or the full-width web export.

Runtime exports live in `public/img/activities/developed`. The earlier original
public files remain retained; `app/content/activities.json` selects developed
exports and retains original source attribution. `activityImageSources` supplies
responsive exports, with sizing that accounts for cover crops.
