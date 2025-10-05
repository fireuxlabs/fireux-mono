# Places data model

_Last updated: 2025-10-05_

## Overview

The `fireux-places` extension now exposes a unified set of TypeScript models that describe both Google Places details and the Firestore-backed records we persist after selection. These types live in `packages/extensions/fireux-places/src/runtime/models/place.model.ts` and should be treated as the single source of truth when building local search flows, Firestore migrations, or UI components.

Key goals:

- Represent the minimum Google Place detail payload we fetch through the server proxy.
- Capture our enriched Firestore documents (including metadata and cached avatars).
- Provide a shared suggestion shape that can merge Firestore hits with live Google autocomplete predictions.

## Core types

| Type                                       | Purpose                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `PlaceSource`                              | Distinguishes between `'google'` predictions and `'firestore'` records.                                                               |
| `LatLng`, `PlaceGeometry`, `PlaceViewport` | Shared geographic primitives reused across Google and Firestore models.                                                               |
| `PlacePhoto`                               | Metadata for Google Place photos (reference, size, attribution).                                                                      |
| `PlaceAvatar`                              | Normalised avatar record we attach to places (favicon, Google photo, or custom upload).                                               |
| `PlaceMetadata`                            | Audit information (created/updated timestamps, authors, tags, notes).                                                                 |
| `Place`                                    | Canonical Google Place details payload with optional website, phones, ratings, and opening-hours data.                                |
| `FirestorePlace`                           | Firestore-backed document we persist once a Google place is accepted; holds metadata, cached avatar, and optional raw Google payload. |
| `PlaceRecord`                              | Union of `Place` and `FirestorePlace` for shared handling.                                                                            |
| `PlaceAutocompleteResult`                  | Autocomplete prediction enriched with optional Firestore linkages.                                                                    |
| `UnifiedPlaceSuggestion`                   | Higher-level suggestion that combines Firestore and Google data for UI presentation.                                                  |

## Usage notes

- When saving a Google place to Firestore, populate `FirestorePlace.metadata` with at least `createdAt` and the actor ID (`createdBy`).
- Attach any cached favicon or photo through the `PlaceAvatar` structure so UI components can render consistent branding.
- Persist the original Google payload in `FirestorePlace.raw` for troubleshooting; we only serialise the fields declared on `Place`.
- Autocomplete flows may stitch Firestore records into the live suggestions list by setting `PlaceAutocompleteResult.source = 'firestore'` and including `firestorePlace` for rich context. UI helpers can then map everything into `UnifiedPlaceSuggestion` instances.
- All new utilities should import these types directly instead of re-stating Google API response shapes.

## Future work

- Define Firestore security rules that enforce the `FirestorePlace` shape.
- Expand `PlaceAvatar.source` when additional logo providers (e.g. Clearbit) are integrated.
- Consider normalising phone numbers and opening hours during ingestion so downstream apps can rely on a consistent format.
