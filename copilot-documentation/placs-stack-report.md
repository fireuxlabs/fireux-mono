# placs-stack-report

_Last updated: 2025-10-06_

## Scope

This report inventories the current "Places" stack inside `packages/extensions/fireux-places`. It captures each module involved in search, persistence, and UI presentation so we can track coverage after the latest cleanup.

### Directory map

- `models/`
- `components/organisms/places/`
- `composables/`
- `pages/`
- `server/api/`
- `server/utils/`

## Modules

### `runtime/models/place.model.ts`

- **Exports:** `Place` interface, `PlaceCard` namespace (`Pill`, `Cell`, `Profile`)
- **Role:** Defines shared data contracts for places persisted in Firestore, displayed in UI, and returned from Google.
- **Notes:** Maintains consistent typing between search results and saved entries.

### `runtime/components/organisms/places/Cell.vue`

- **Role:** Shared card component used in saved list, suggestions, and selected-place preview.
- **Highlights:**
  - Displays dynamic badge based on `meta_right` (e.g., Saved vs Google).
  - Filters out Google fallback icons so we don’t show default pin artwork.

### `runtime/components/organisms/places/SavedSection.vue`

- **Role:** Wraps the saved places header, loading states, empty messaging, and list rendering.
- **Inputs:** `label`, `badgeCount`, `loading`, filtered `cells`, `query`, and `queryHasMinLength` to drive copy.
- **Emits:** `select` when a saved place is clicked, delegating to the page/controller.

### `runtime/components/organisms/places/SuggestionsSection.vue`

- **Role:** Presents Google suggestion cells when available and handles selection action wiring.
- **Inputs:** `cells` array of suggestion cards.
- **Emits:** `select` to bubble the chosen suggestion back to the page.

### `runtime/components/organisms/places/SelectedDetails.vue`

- **Role:** Shows the selected place summary, metadata grid, and clear action.
- **Inputs:** `place` (raw details) and `placeCell` (formatted card view).
- **Emits:** `clear` when the dismiss button is pressed.

### `runtime/composables/usePlacesSaved.ts`

- **Role:** Wraps Firestore read composable, normalizing saved places for the UI.
- **Key responsibilities:**
  - Filters documents by `appId` and ensures `Place` typing.
  - Supplies `savedPlaces`, `savedPlacesMap`, `savedPlaceCells`, and a `toPlaceCell` helper.
  - Surfaces `savedPlacesLoading` flag so the page can show skeleton states.
- **Depends on:** `useFireUXConfig`, `useFirestoreRead`, and an inline `PLACE_ICON_FALLBACK` constant.

### `runtime/composables/usePlacesSearchController.ts`

- **Role:** Primary controller coordinating user query input, autocomplete suggestions, saved-place filtering, selection, and persistence.
- **Key responsibilities:**
  - Debounces user input and invokes Google autocomplete via `useGooglePlaces`.
  - Prefers local saved matches before network calls and slices suggestions to six entries.
  - Persists selected Google places to Firestore (respecting `appId`) via `useFirestoreManager`.
  - Maintains derived UI state (`savedSectionLabel`, `savedBadgeCount`, `selectedPlaceCell`, etc.).
- **Notes:**
  - Uses an inline `MIN_PLACES_QUERY_LENGTH` guard to avoid noisy network calls.
  - Resets Google session tokens when the query changes or suggestions clear.

### `runtime/composables/useGooglePlaces.ts`

- **Role:** Encapsulates Google Places autocomplete and details retrieval using REST proxy endpoints.
- **Key responsibilities:**
  - Provides `searchPlaces` (simple array) and `searchPlacesWithMeta` (diagnostic wrapper).
  - Retrieves place details, attempts avatar enrichment (logo discovery, favicons), and caches repeated requests.
  - Manages session tokens and exposes loading/error reactivity for the controller.
- **Depends on:** `/api/places/autocomplete`, `/api/places/details`, `/api/places/photo`, `/api/places/logo`.
- **Diagnostics:** Maintains `lastStrategy` and `lastDiagnostics` to trace server vs cache usage.

### `runtime/pages/places.vue`

- **Role:** UI entry point for Places admin view.
- **Highlights:**
  - Delegates all state and actions to `usePlacesSearchController`.
  - Renders saved places, suggestions, and detail views via dedicated organisms components for cleaner markup.
  - Provides loading/error feedback based on composable state.

## Server layer

### `runtime/server/api/autocomplete.get.ts`

- **Role:** Server proxy to Google Places Autocomplete REST endpoint.
- **Key behaviors:**
  - Rate limits by IP (1-minute window, 120 requests).
  - Applies location + radius defaults and strips response payload to essentials.
  - Returns empty predictions on errors while setting status codes for observability.

### `runtime/server/api/details.get.ts`

- **Role:** Retrieves place details from Google Places Details endpoint for a given `place_id`.
- **Behavior:** Validates input, fetches, and returns `result` payload or `null` on failure.

### `runtime/server/api/photo.get.ts`

- **Role:** Fetches place photo assets and manages redirects or binary passthrough.
- **Behavior:**
  - Resolves `photo_reference` to an asset URL and sets caching headers.
  - Supports width/height parameters with sensible defaults.

### `runtime/server/api/logo.get.ts`

- **Role:** Discovers website logos to upgrade fallback avatars.
- **Behavior:**
  - Normalizes incoming website URLs and probes multiple common file paths.
  - Falls back to Google favicon service when no direct asset is found.

### `runtime/server/utils/places-api-key.ts`

- **Role:** Resolves the Google Places API key from runtime config or environment.
- **Usage:** Shared across API handlers to avoid duplicating env resolution logic.

## Interactions & flow

1. User types in the Places page.
2. `usePlacesSearchController` debounces input.
3. If query meets `MIN_PLACES_QUERY_LENGTH` and no saved match exists, controller calls `useGooglePlaces.searchPlaces`.
4. `useGooglePlaces` hits `/api/places/autocomplete`, which proxies Google and returns suggestion cells.
5. Selecting a suggestion triggers `useGooglePlaces.getPlaceDetails`, enhancing the avatar via `/api/places/logo` when possible.
6. Controller persists the detailed place to Firestore and exposes it via `savedPlaces`.
7. UI updates saved list and selected card accordingly.

## Recent validation

- `pnpm typecheck:apps` — ✅ (2025-10-06)

## Follow-ups

- Consider documenting Firestore schema expectations (current payload lives inline in controller).
- Evaluate extracting rate-limit diagnostics into shared utility if other proxies require it.
