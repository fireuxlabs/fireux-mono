# Landing template family

Updated: 2026-08-10
Ref: 93c271035
Role: map, not canon

## Family

FireUX publishes the canonical reusable landing compositions at `/templates`.
A catalogue definition selects one anatomy component and a bounded set of
brand injections. FireUX and Misebox may both offer the same theme; Misebox's
`/templates` route is a hospitality seller doorway to the canonical preview,
not another implementation.

`Page → Scenes → Layers → Elements`

The page owns catalogue/detail chrome and viewport controls. The anatomy owns
scene markup and presentation CSS. An injection supplies identity data only.

## Current member

Scene One is proved by the Friiites landing composition and implemented once in
`components/Template/SceneOnePreview.vue`. Friiites, Deanos Smash Burger, and
Misebox Restaurant are three inputs to that same component.

## Delta register

| Difference                                                      | State    | Reason                                                                          |
| --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| Friiites has an available current wordmark                      | accepted | App-owned source evidence exists                                                |
| Deanos and Misebox Restaurant use typographic wordmark fallback | accepted | Demo Kitchen source declares names and media but no separate canonical wordmark |
| Friiites preview omits product photography                      | accepted | no approved reusable catalogue crop is currently declared                       |
| `projects/templates/fireux-template` remains separate           | accepted | it is a guarded starter App, not a presentation catalogue                       |
| FireUX and Misebox expose theme request paths                   | accepted | seller ownership may differ while anatomy and injection source stay shared      |

## Verification

Start with `scripts/guards/landing-templates.mjs`, then build the FireUX App.
In browser checks, assert the scene names and nine layer hooks stay unchanged
while brand content changes, and test both the real browser breakpoint and the
container-responsive embedded phone preview.
