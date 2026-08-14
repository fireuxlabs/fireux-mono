# Templates

Updated: 2026-08-14
Ref: e57b8cc4f
Role: map, not canon

## English meaning

Dictionary.com defines a template as a pattern, model, or guide and, in
computing, as a predesigned format and structure ready to be filled in.

Source: <https://www.dictionary.com/browse/template>

FireUX uses that ordinary meaning:

> A template is a reusable presentation structure completed by supplied
> identity, content, assets, routes, and operational data.

The template is the empty pattern. A proving App demonstrates that pattern;
it does not become part of the pattern.

## What a template owns

- Page, section, layer, and element anatomy.
- Responsive layout and visual relationships.
- Reusable component composition.
- Named input positions and optional states.
- Presentation behaviour that remains valid across consumers.

## What a template consumes

- Entity identity and approved brand assets.
- Content from its canonical owner, such as `Menu.description`.
- Domain records and explicit roles.
- App- or Kitchen-owned links and actions.
- Theme values supplied through the documented presentation layers.

## What a template must not own

- A restaurant, cuisine, Dish name, Dish ID, or Menu section name.
- Brand copy, slogans, wordmarks, patterns, or product photography.
- Consumer-specific routes or ordering destinations.
- Selection rules based on one proving App's slugs or collection order.
- Fixtures presented as reusable defaults.

If a value would be wrong for a sushi restaurant, barbecue restaurant, hotel,
or another valid consumer, it is not template-owned.

## Proving and extraction

An App may prove a template by supplying real content and identity. A second
materially different App tests whether the structure is genuinely reusable.
Only the shared presentation pattern belongs to the template package. Each
consumer retains its own data, copy, assets, and routes.

## Template One

Template One is the first Misebox Kitchen landing template. Its detailed
catalogue, eligibility, anatomy, and verification map remain in
`docs/concepts/landing-templates.md`. That document inherits this definition
and cannot broaden template ownership.

## Verification questions

Before adding a template value, ask:

1. Is this structure, or is it consumer content?
2. Which canonical owner supplies it?
3. Does the component select by explicit role rather than a consumer ID?
4. Would the result remain truthful for a materially different Kitchen?
5. Can missing optional input be omitted without invented fallback copy?
