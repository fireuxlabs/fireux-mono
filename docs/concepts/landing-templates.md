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
slice has one Kitchen toggle covering Basic, Console and App capability: the
Basic remains an unassigned root-only model example because current source has
no proven named Basic Kitchen fixture. Pizza the Action and Deano's Smash are
Console Demos; Deano's also carries an explicitly incremental App-preview
fixture. Friiites is the proven tenant App.
Every selection shows Basic palette props; richer sections either show their
current evidence or state that the selected Kitchen has no such props. Rule is
the one visible atom. Core `BrandPalette` is an input value object, not an atom.

Resolution is progressive and dynamic:

`defaults ← Place presentation ← Kitchen Menu style ← Console theme ← App template overrides`

Current source proves Place `brand_palette` and Kitchen `menus.style`, including
dynamic compaction and resolution. Console theme and App template overrides are
not persisted models yet and remain explicitly `not-modelled` in the specimen.
Do not copy resolved values upward during onboarding.

## Delta register

| Difference                                            | State      | Reason                                                                     |
| ----------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| Kitchen identity permits media overrides              | accepted   | current Kitchen model owns sparse identity media overrides                 |
| Console theme layer                                   | to-confirm | no persisted Console theme contract exists                                 |
| App template override layer                           | to-confirm | no persisted template selection/override contract exists                   |
| `projects/templates/fireux-template` remains separate | accepted   | it is a guarded starter App, not a presentation catalogue                  |
| FireUX and Misebox expose theme request paths         | accepted   | seller ownership may differ while anatomy and injection source stay shared |

## Verification

Start with `scripts/guards/landing-templates.mjs`, then build `fireux-misebox`
and the Misebox App. In browser checks, assert the provenance rows remain
structurally unchanged while the BrandPalette values and Rule colour change.
