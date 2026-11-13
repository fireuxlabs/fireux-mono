# Seven-frame Alpine ascent

Seven full-scene frames extracted from one continuous generated eight-second
camera ascent. The start image is the existing photographic scene, retained
unchanged in `../landing-v2/distance.png`. Runtime frames do not use separate
mountain cutouts or independent CSS camera transforms.

Source model: `video/gemini-omni-flash` (720p, 9:16).
Source job: `cb83e6ec-c426-4f8c-981b-8c76927e7210`.
Extraction job: `0d2d76b7-e568-48f9-bff2-764253e90f20`.
Source clip: https://cdn.creativeclaw.co/u/cb9c7301/videos/b0f3278e-5827-40c1-9b8c-fde3e9afba32.mp4

Frames 01–07 sample 0, 1.3, 2.6, 3.9, 5.2, 6.5 and 7.8 seconds respectively.
These source exports are unchanged; runtime WebP files are optimized separately.
The animation illustrates upward camera travel over the same mountain landscape.
It is generated concept imagery, not documentary operator tour footage.

## Continuous runtime delivery

The source clip is retained as `ascent-original.mp4` (720×1280, 24 fps).
Runtime delivery is interpolated to 60 fps with FFmpeg motion compensation,
with audio removed, mild edge sharpening, frequent H.264 keyframes, no B frames
and fast-start metadata. This improves temporal sampling and seeking; it is not
AI resolution recovery. The original photo supplies the higher-quality static
poster. The seven extracted views remain as review/source artifacts.
