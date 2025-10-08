# Google Search Avatar Chain

_Last updated: 2025-10-07_

## Summary

Autocomplete supplements from Google currently return `PlaceCard.Cell` entries without real photos because the Autocomplete HTTP response does not include photo metadata. As an interim step we request placeholder images via `/api/places/logo`, but truly accurate imagery still requires a follow-up Place Details lookup (to obtain `photos[].photo_reference`) followed by our `/api/places/photo` helper to resolve the image URL.

## Client Flow

1. **`packages/extensions/fireux-places/src/runtime/composables/usePlacesSearch.ts`**

   - Calls `fetchGoogle(query, exclude, need)` when Firestore results are below the minimum threshold.
   - Expects `PlaceCard.Cell` items that include an `avatar` string but will accept `null`.

2. **`packages/extensions/fireux-places/src/runtime/composables/usePlacesGoogle.ts`**

   ```ts
   export async function fetchGoogle(
     query: string,
     excludeIds: Set<string>,
     limit: number
   ): Promise<PlaceCard.Cell[]> {
     // ...
     const preds = Array.isArray(json?.predictions) ? json.predictions : []

     const cells = preds
       .filter(/* remove duplicates */)
       .slice(0, limit)
       .map((p: any): PlaceCard.Cell => {
         const main = p?.structured_formatting?.main_text
         const secondary = p?.structured_formatting?.secondary_text
         const desc = p?.description
         return {
           place_id: canonicalPlaceId(p.place_id),
           name: main || desc || 'Unknown place',
           avatar: null,
           formatted_address: secondary || desc || undefined,
           source: 'google',
         }
       })
     // ...
   }
   ```

   - The Autocomplete payload does not contain photo references, so `avatar` is hard-coded to `null`.

3. **`packages/extensions/fireux-places/src/runtime/components/organisms/places/Search/Section.vue`**
   - Displays the `PlaceCard.Cell` array, now showing raw JSON for debugging. Google records currently show `"avatar": null`.

## Server Autocomplete Endpoint

4. **`packages/extensions/fireux-places/src/runtime/server/api/autocomplete.get.ts`**

   ```ts
   const url = new URL(
     'https://maps.googleapis.com/maps/api/place/autocomplete/json'
   )
   url.searchParams.set('input', query)
   // ... radius, location, key, etc.

   const res = await fetch(url.toString())
   const data = await res.json()
   return {
     predictions: (data.predictions || []).slice(0, 4).map((p: any) => ({
       place_id: p.place_id,
       description: p.description,
       structured_formatting: p.structured_formatting,
       types: p.types,
     })),
   }
   ```

   - Autocomplete API does **not** return `photos` or `icon` URLs, so there is no avatar data to pass downstream.

## Existing Photo Infrastructure

5. **`packages/extensions/fireux-places/src/runtime/server/api/photo.get.ts`**

   - Wraps Google Places **Photo** API: accepts a `photo_reference`, proxies the redirect, and streams the image back to the client.

6. **`packages/extensions/fireux-places/src/runtime/models/place.model.ts`**

   ```ts
   export interface GooglePlace extends BasePlace {
     source: 'google'
     photo_reference?: string | null
     photo_url?: string | null
     // ...
   }

   export function toStoredPlace(g: GooglePlace): Place {
     const search_term = `${g.name} ${g.formatted_address}`.toLowerCase()
     return {
       ...g,
       source: 'firestore',
       avatar: g.photo_url ?? null,
       search_term,
       created_at: new Date(),
     }
   }
   ```

   - The shape already supports `photo_reference` → `photo_url` → `avatar`, but the Autocomplete pipeline never populates those fields.

## Gap and Next Steps

- **Gap:** Autocomplete data lacks photo metadata. We need a follow-up Place Details request for each suggestion to obtain `photos[0].photo_reference` (and optionally `icon_background_color`, etc.).
- **Suggested chain for avatars:**
  1. After `fetchGoogle` receives predictions, call a new detail endpoint for the top `need` suggestions.
  2. Detail endpoint hits `https://maps.googleapis.com/maps/api/place/details/json?place_id=...&fields=photos,name,geometry,...`.
  3. For each detail response, grab `photos[0].photo_reference` and request `/api/places/photo?photo_reference=...` to resolve a CDN URL (or proxy the image inline).
  4. Attach the resolved URL to `PlaceCard.Cell.avatar` and, when promoted to Firestore, persist via `toStoredPlace`.
- We already have the photo proxy endpoint; we just need to wire detail lookups into the search supplement before returning suggestions.

## Related Files to Update When Implementing Avatars

- `packages/extensions/fireux-places/src/runtime/composables/usePlacesGoogle.ts`
- `packages/extensions/fireux-places/src/runtime/server/api/autocomplete.get.ts`
- `packages/extensions/fireux-places/src/runtime/server/api/detail.get.ts` (new helper to add)
- `packages/extensions/fireux-places/src/runtime/server/api/photo.get.ts`
- `packages/extensions/fireux-places/src/runtime/models/place.model.ts`
- `packages/extensions/fireux-places/src/runtime/components/organisms/places/Search/Section.vue`

Documenting this chain should make it clear why the fallback shows `avatar: null` today and what additions are required to surface Google-provided photos.
