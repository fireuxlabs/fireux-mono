# Places Avatar Resolution

_Last updated: 2025-10-08_

This note captures how the Places search stack resolves, caches, and uploads avatars while keeping every logo fetch abortable. Use it as the companion to `places-search-report.md` when changing either the browser orchestration or the Firestore confirmation pipeline.

## High-level flow

1. **Shortlist render** – Every visible Google-sourced cell delegates to `loadLogoForPlace` for a lazy logo lookup the moment it mounts.
2. **Selection** – Choosing a different suggestion prioritises that place, cancels stale fetches, and waits for the logo promise before letting a confirm dismiss the dialog.
3. **Confirmation** – The selected preview (with its current avatar) becomes the upload source while the final Firestore document receives a fresh Storage-backed image.

## Browser cache & cancellation contract

`packages/extensions/fireux-places/src/runtime/composables/usePlaceLogos.ts`

- **Result cache** – `logoResultCache` stores the resolved URL (or an explicit `null`) so the same place never re-fetches within the session.
- **Promise cache** – `logoPromiseCache` deduplicates overlapping requests; callers that arrive mid-flight receive the same promise.
- **Abort controller pool** – `logoAbortControllers` and `detailsAbortControllers` map canonical place IDs to their active `AbortController`. Cancelling removes both the controller and the pending promise entry.
- **Website hints** – `resolveWebsite` asks `/api/places/details` for `website` and `url`, normalises them, and feeds `fetchLogo` with either the domain or the raw query.
- **Priority fetches** – Callers can opt into `{ priority: true }` to avoid cancelling an in-progress request for the same place before reusing it (the selected cell uses this).
- **Force reloads** – `{ forceReload: true }` clears cached promises/results and aborts the current fetch before starting a fresh request. The selected card and the per-cell watcher use this when the first attempt returns an empty logo (often after a quick abort).
- **Signal merging** – `mergeSignals` bridges nested abort controllers so cancelling either the shortlist sweep or the individual fetch aborts the shared request safely.

### Cancellation helpers

| Helper                        | Responsibility                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `cancelLogoRequest(placeId)`  | Abort a single in-flight logo promise for the supplied place. Used internally when firing a non-priority load.                               |
| `cancelLogoRequests(except?)` | Abort every request except the canonical IDs inside the optional `Set`. The search UI calls this whenever the shortlist or selection shifts. |

Aborting details or logo calls treats an `AbortError` as a silent `null` resolution so the UI simply keeps showing the spinner until a replacement load resolves (or the cell is unmounted).

## UI orchestration

`packages/extensions/fireux-places/src/runtime/components/organisms/places/Search/Section.vue`

- Every debounce cycle that replaces the shortlist calls `syncLogoRequests()`. That function forwards the active result IDs (plus the selected cell if present) to `cancelLogoRequests`. Anything from the previous search is immediately aborted.
- Selecting a place bumps the `selectRequestId`, stores the preview, and calls `syncLogoRequests([cell.place_id])` so the chosen suggestion becomes the only guaranteed survivor. The subsequent `loadLogoForPlace(cell, { priority: true })` waits for the shared promise and lets the confirm button spin until completion.
- If the priority load resolves to `null`, the selected card immediately retries with `forceReload: true`, ensuring fast pointer hops still get a fresh logo once the new request completes.
- Clearing or confirming re-runs `syncLogoRequests()` to free any outstanding fetches now that we either returned to the shortlist or navigated away.
- `waitForLogoLoad` keeps polling while `isLoadingLogo` is `true`, ensuring the confirmation flow never races ahead of the logo upload pipeline.

`packages/extensions/fireux-places/src/runtime/components/organisms/places/Cell.vue`

- Each cell tracks its own `requestToken` so reactivity churn (new shortlist, cleared selection) simply invalidates the old promise without manually cancelling it.
- Cells rely on the shared composable cache, so even if multiple renders request the same logo, they land on the same promise and immediately settle with the cached URL once one succeeds. When a render sees the fetch resolve to `null`, it performs a one-time `forceReload` retry before giving up.

## Confirmation pipeline

`packages/extensions/fireux-places/src/runtime/components/organisms/places/Search/Section.vue`

1. `resolvePlaceForConfirmation` first tries `/api/places/details` to hydrate Firestore metadata and falls back to the preview if the network fails.
2. `resolveUploadSource` prefers the sanitised cell avatar (the freshly resolved logo) and only reuses the draft avatar if it survived the sanitisation guard.
3. A Storage upload via `uploadFromUrl('places/${placeId}/avatar', url)` produces the canonical avatar path saved to Firestore.
4. Navigation waits until the Storage promise resolves so the downstream `/places/[id]` view renders with the persisted avatar immediately.

## Edge cases & guards

- **Missing Place ID** – `canonicalPlaceId` strips stray quotes and ensures empty IDs short-circuit before any network call.
- **Google default pin** – `sanitizeAvatar` rejects the standard `mapfiles/place_api/icons` assets so we never upload low-quality placeholders.
- **Abort races** – If a shortlist update finishes before a prior fetch resolves, the abort handler simply returns `null`; the UI either retries on the next render or clears the spinner if the cell unmounted.
- **SSR safety** – All browser-specific branches guard on `typeof window === 'undefined'` so server rendering never attempts to touch `fetch` or `AbortController`.

## Operational checklist

- To wipe cached logos during a debugging session, refresh the browser. The caches are module-scoped and reset with each reload.
- When altering the API endpoints, keep the Accept header (`application/json`) intact; the composable expects JSON payloads for both `/api/places/logo` and `/api/places/details`.
- Use `cancelLogoRequests()` in any new UI surface that paginates or filters the shortlist—failing to do so will leak in-flight Fetch requests when navigating quickly between queries.

## Follow-ups

- Consider persisting the logo cache to `sessionStorage` so reloading the page after a search keeps already-resolved avatars.
- Explore prefetching Firestore avatars for saved places to skip an extra Storage read when re-confirming an existing document.
