# Professional Experience Place Selection

## Overview

Professional experience entries now support linking directly to saved Google Places using the shared search surface from the `fireux-places` extension. Editors can open a slideover search, pick the right venue, and have key fields (name, address, logo) pre-filled in a single action.

## UI Flow

1. In `OrganismsProfilesProfessionalFieldsExperienceField` (edit mode) click **Link a place**.
2. A slideover renders `OrganismsPlacesSearchSection` with `mode="select"`, reusing the full places search experience.
3. Selecting and confirming a suggestion emits `place:selected`, which updates the active experience item:
   - `place_id` becomes the canonical Google/Firestore ID
   - `name` copies the place name (editable afterwards)
   - `formatted_address` and `short_address` are derived from the place
   - `image_url` stores the resolved logo when available
4. Manual address/logo fields are disabled while a place is linked. Use **Remove link** to revert to freeform editing.

## Data Mapping

| Experience field        | Source when linked                              |
| ----------------------- | ------------------------------------------------ |
| `place_id`              | Canonical place ID from selection               |
| `name`                  | `place.name`                                    |
| `formatted_address`     | `place.formatted_address`                       |
| `short_address`         | First two comma-delimited parts of the address  |
| `image_url`             | Sanitized avatar from `PlaceCard.Cell` / `Place` |

If the selection resolves a Google place, the search section persists it via `savePlace` before emitting the payload. Firestore results emit immediately with their cached metadata.

## Component Notes

- `OrganismsPlacesSearchSection` accepts two new props:
  - `mode`: `'manage'` (default) keeps the existing "save & navigate" behaviour, `'select'` emits the payload for embedding contexts.
  - `initialQuery`: optional seed text for the search box.
- `place:selected` emits `{ place, cell }`, where `place` is the stored `Place` payload and `cell` is the enriched card used across the UI.
- The professional field component increments a key each time the slideover opens to ensure the initial query is respected.

## Testing Checklist

- Link a place from both Firestore-backed and Google-supplemented results.
- Confirm avatars populate after the "fetching logo" spinner completes.
- Remove the link and confirm manual address/logo inputs re-enable.
- Save the profile and validate the experience document includes the new place fields.
