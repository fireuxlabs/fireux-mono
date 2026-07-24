# Interlaken Essen Artistic Direction

Status: active visual canon  
Direction: Alpine–Mœbius  
Scope: Interlaken Essen product UI, editorial artwork, social media, maps,
icons, campaigns, and printed material

This document inherits the repository rules in `AGENTS.md`,
`docs/ai/gpt-context.md`, and `docs/ai/misebox-context.md`. It defines the
project-specific visual character. Current source and approved assets remain
the implementation authority.

## The idea

Interlaken Essen should feel as though a great old Swiss tourist poster has
opened into a strange, humane, hand-drawn world.

The foundation is real Interlaken: its exact mountain silhouettes, lakes,
valley, streets, farms, fridges, food, weather, and local life. Over that truth
sits the imaginative freedom of European ligne-claire science-fiction
illustration: organic contour lines, elegant curves, unusual scale, quiet
surrealism, and generous negative space.

The result is **Alpine–Mœbius**. It is an influence and a direction, not an
attempt to copy a particular artwork.

## Non-negotiable principles

### 1. Place truth comes first

Every landscape-led image must begin with a real reference. Interlaken must be
recognisable to somebody who lives here, not merely plausible to a tourist.
Preserve defining mountain profiles, the valley geometry, the relationship of
the lakes, and recognisable built landmarks.

Imagination may bend perspective, simplify scale, or introduce lyrical curves.
It must not replace local geography with generic Alpine scenery.

### 2. Drawn, not rendered

Artwork should feel made by an illustrator:

- fine, confident ink contours;
- organic line weight and imperfect curves;
- flat or softly weathered colour fields;
- selective hatching, stipple, or paper grain;
- controlled detail with calm areas around it;
- forms described by line and shape rather than glossy light effects.

Avoid photorealistic rendering, plastic 3D volume, game-concept art, cinematic
glow, airbrushed fantasy, and generic AI texture.

### 3. Swiss-poster clarity

One image, one idea, one dominant phrase. Composition should borrow from
mid-century Swiss travel posters:

- immediate silhouette;
- strong foreground/middle/background separation;
- bold condensed display type;
- limited palette;
- purposeful cropping;
- typography integrated with the picture;
- enough negative space for the message to breathe.

### 4. Restraint creates the magic

Use roughly three to five depth planes. Choose a few beautifully observed
details rather than filling every surface. The Mœbius influence comes through
the intelligence and poetry of the line, not through visual busyness.

### 5. Local, warm, and useful

This is a marketplace for neighbours, not a luxury tourism brand. People,
produce, huts, honesty fridges, kitchens, and businesses should feel generous,
ordinary, and real. The art may be curious and dreamlike; the product must
remain welcoming and easy to use.

## Visual recipe

### Landscape

Start from a real photograph, map, or on-site reference. Identify the two or
three geographic shapes that make the view unmistakable. Simplify everything
else.

Mountain and land contours should be long, calm, and continuous. Curves may
flow across terrain like topographic or wind lines, but they must belong to the
drawing. Do not add isolated geometric stickers—perfect circles, floating
badges, or decorative symbols—unless the same line language integrates them
into the scene.

### Detail level

Use three working levels:

- **Poster:** low detail, bold silhouette, readable at thumbnail size.
- **Editorial:** medium detail, a few discoveries rewarded at full size.
- **Map/icon:** extremely selective detail, with recognition before decoration.

When uncertain, remove approximately twenty percent of the detail.

### Colour

The core palette comes from the product:

| Role | Colour |
| --- | --- |
| Alpine ink | `#17352b` |
| Warm paper | `#fbf3df` |
| Moss green | `#2f6a50` |
| Poster yellow | `#f4c653` |
| Goat-tongue red | `#cf4438` |

Yellow and red are accents, not automatic decorations. They should identify a
real focal point, carry meaning, or balance the composition. Natural landscape
colour may extend the palette, but it should remain slightly muted and
print-like.

Pure white, pure black, neon colour, and broad modern gradients should be rare.

### Typography

Headlines use a tall, condensed, heavy poster face or the current
`--market-display` family. They may be uppercase, tightly tracked, and
deliberately large.

Supporting copy is plain, sturdy, and highly readable. It should never compete
with the headline.

Typography should feel printed into the composition rather than laid over a
finished image. Avoid fashionable luxury serif treatments, bubbly startup
type, excessive outlines, and novelty lettering.

### The goat

The Interlaken goat is the seal of the project. Use it as a mark, medallion,
stamp, pin, or character only when it has a clear role. Preserve its black,
cream, and red heraldic identity.

Do not scatter the goat decoratively or redraw it in an unrelated cartoon
style.

## Translating the art into UI

The application remains simpler than the campaigns.

- Let the artwork own the atmosphere and whitespace.
- Use translucent ink or paper pills over imagery.
- Use warm paper for focused cards and forms.
- Use fine cream rules and organic contour lines instead of generic shadows.
- Keep navigation compact, legible, and calm.
- Use the goat mark sparingly as identity, not ornament.
- Buttons should be solid, tactile shapes with direct language.
- Modals and notices should feel like small poster compositions, not imported
  component-library cards.

Accessibility and clarity outrank visual flourish. Texture must not reduce
contrast, and illustration must not obscure actions.

## Language and tone

Public-facing copy is readable local Swiss German. It should sound neighbourly,
direct, and unforced—not like a tourism board and not like dialect theatre.

Short anchor phrases are strongest:

- Choufe
- Verchoufe
- Futter
- Chum cho esse
- Us dr Region

English working notes are fine, but finished Interlaken-facing material follows
the approved Swiss German wording.

## What does not belong

Reject artwork or UI that contains:

- generic mountains that do not resemble Interlaken;
- glossy AI-fantasy scenery;
- excessive micro-detail;
- random perfect suns, moons, circles, or floating geometry;
- fake nostalgia or distressed texture on every surface;
- chalet clichés used without local truth;
- 3D mascots, plastic icons, or corporate vector people;
- gradients used as the main visual idea;
- generic food photography collages;
- too many badges, labels, ribbons, or competing messages;
- direct imitation of a specific Mœbius image.

## Artwork workflow

1. Choose the exact surface and its single communication job.
2. Gather a real local reference and identify the recognisable geography.
3. Decide the detail level: poster, editorial, or map/icon.
4. Establish one dominant silhouette and one typographic hierarchy.
5. Apply the limited palette and organic line language.
6. Remove unnecessary detail and decorative geometry.
7. Check recognition with the artwork small and with the text hidden.
8. Check the final copy with a local-language lens.
9. Export the required ratios from the same art master.

## Review checklist

Before approving a visual, ask:

- Would an Interlaken local recognise the place?
- Is the main idea readable in two seconds?
- Does it feel drawn rather than rendered?
- Is the linework elegant and organic?
- Is the detail restrained?
- Does every accent shape have a reason?
- Does the typography belong to the picture?
- Does it still work at phone and social-feed size?
- Could this only be Interlaken Essen?

## Current authority and maintenance

Current visual implementation:

- `app/assets/styles/main.css`
- `app/components/Market/OnboardingModal.vue`
- `public/img/app/`

Update this document when a repeatedly used visual rule becomes stable. Do not
record temporary campaign decisions, one-off prompt wording, or task history
here.
