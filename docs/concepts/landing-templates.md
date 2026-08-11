# Landing template family

Updated: 2026-08-10
Ref: 93c271035
Role: map, not canon

## Family

Misebox publishes the canonical Kitchen landing compositions at `/templates`.
Template One's contract, anatomy and fixtures live in `fireux-misebox` so the
Misebox App and tenant Apps can consume one source. FireUX may list the family,
but refers to the Misebox-owned detail rather than copying it.

`Page → Scenes → Layers → Elements`

The page owns catalogue/detail chrome and viewport controls. The anatomy owns
scene markup and presentation CSS. An injection supplies identity data only.

## Current member

Template One is the neutral family at `/templates/template-one`. Its first
slice compares Place-level presentation across Seehotel Bönigen, Pizza the
Action, Friiites and Deano's Smash. Every selection is equally complete at this
level: it shows the single semantic `place_primary_color` input. Current Place
storage retains the source-backed `media_backdrop_color` field pending a
separate guarded migration. Console and App props remain separate progression
levels. Core `BrandPalette` is an App-template input value
object, not a Place atom.

The page also renders one shared neutral Menu sample with one section and one
item through the real `MenuBrowseCatalogue` presentation. Its content belongs
to no Kitchen and stays identical across the toggle. With no Menu style or
Console theme attached, it retains the shared out-of-the-box Menu defaults; the
Place backdrop is displayed separately and does not style the Menu. It is a
presentation specimen, not a persisted Menu or MenuItem record.

Template availability begins at App management. The current Place-level
comparison does not imply that a Root or Console Kitchen can select or purchase
Template One.

Root has no theme or template. Console adds Kitchen Menu `PageStyle` only. App
extends that effective Console theme with its selected template and applies the
result consistently across every tenant/franchise Kitchen in that App. Template
selection is App-owned, not a per-Kitchen franchise choice.

At the App level, Friiites and Deano's Smash consume the same Scene One
composition. Friiites proves it with canonical identity media; Deano's uses its
existing Demo-owned transparent logo/wordmark lockup. The shared media frame
contains both wide and square identity aspect ratios without branching. The
Scene One injection may align that same identity frame left or centre;
Friiites uses left alignment and Deano's uses centre alignment. This is a
bounded presentation option, not alternate scene markup. The charcoal surface
is owned by Template One and is identical for both injections; it is not a
brand asset or configurable delta. Both current fixtures declare
`present: 'wordmark'`; the wordmark itself resolves from Root identity rather
than being duplicated into Scene One configuration. The
catalogue and live Friiites App consume the same component; neither owns
duplicate Scene One markup or CSS. The Process composition remains available
but is not mounted in the current one-scene preview.

Resolution is progressive and dynamic:

`default Menu style ← Console Kitchen PageStyle ← App Brand System + Template`

Current source proves Place `media_backdrop_color` and Kitchen `menus.style`,
including dynamic compaction and resolution. The Kitchen Menu style is the
Console theme; it is not followed by a second Console-theme system. App Brand
System and template assignment are not persisted models yet. Do not copy
resolved values upward during onboarding.

## Delta register

| Difference                                            | State      | Reason                                                                     |
| ----------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| Kitchen identity permits media overrides              | accepted   | current Kitchen model owns sparse identity media overrides                 |
| Console theme is Kitchen Menu `PageStyle`             | accepted   | one Console theme contract; no parallel theme system                        |
| App template override layer                           | to-confirm | no persisted template selection/override contract exists                   |
| `projects/templates/fireux-template` remains separate | accepted   | it is a guarded starter App, not a presentation catalogue                  |
| FireUX and Misebox expose theme request paths         | accepted   | seller ownership may differ while anatomy and injection source stay shared |

## Verification

Start with `scripts/guards/landing-templates.mjs`, then build `fireux-misebox`
and the Misebox App. In browser checks, assert the provenance rows remain
structurally unchanged while the BrandPalette values and Rule colour change.
