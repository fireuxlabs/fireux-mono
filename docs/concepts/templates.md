# Templates

Updated: 2026-08-14
Ref: d5efe9160
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

Templates have two separate proof axes:

- Materially different Kitchens or Apps rendering one template test that
  template's reusability and freedom from consumer leakage.
- Separately named templates test the shared template-family contract.

Template One is the family baseline. A real Template Two may begin as an
intentionally aligned proving sibling with its own `TemplateTwo*` names,
components, functions, styles, and product purpose. It then differentiates in
anatomy, interaction, requirements, or behaviour. Initial equivalence is a
construction technique, not proof; only family mechanisms that survive that
differentiation are candidates for cross-template extraction.

Template Two adopts any independently established catalogue identity,
compatibility, readiness, and renderer-boundary checks from its first save.
Those fundamentals do not require copied scene anatomy or a shared template
engine.

A proving App demonstrates a template by supplying real content and identity;
it does not become part of the pattern. Each consumer retains its own data,
copy, assets, and routes. A second branded fixture alone does not prove a
second template.

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
