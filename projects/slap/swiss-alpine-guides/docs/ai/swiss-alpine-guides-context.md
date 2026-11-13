# Swiss Alpine Guides context

Updated: 2026-11-12
Role: living context
Scope: Swiss Alpine Guides App

## Inheritance and purpose

Inherit repository `AGENTS.md`, `docs/ai/gpt-context.md`, and the Apps That Slap
context at `packages/ecosystem/fireux-slap/docs/ai/apps-that-slap-context.md`.
Keep this App focused on heli-skiing and heliboarding discovery and enquiries.

## Ownership and boundaries

The App owns its routes, local scene composition, mountain motion, tour copy,
brand exports, enquiry validation and deployment target. `nuxt.config.ts`
selects the standard App bundle and Slap layer. `app/app.vue` delegates the
provider, page outlet, initialization and head lifecycle to `FireuxApp`.
The App-local `alpine` layout composes `NavigationHeader`, the accessible skip
link, native content slot and footer. The public header reuses native `UHeader`
and `UNavigationMenu` with Home, Tours, Tour information and Contact links;
Nuxt UI owns its mobile overlay and focus handling. The image-led opening
retains its small summit padding below the sticky header. Hero text appears
after scrolling; reduced motion presents that copy below the static image.
The motion coordinator accounts for the native header’s sticky inset, and
landing anchors retain space below it. Internal operator controls are not
part of this public navigation.
Core and reusable Bookings architecture remain with their package owners and
fireux-main; this App does not implement the architectural-reset handoff.

`app/pages/index.vue` composes the named Hero, Tours and Enquiry surfaces.
The Tours panel naturally overlaps the closing mountain scene; each sourced
route offers an internal detail page and a route-selected enquiry. The hero’s
closing text fades as this panel arrives. These are App-owned tour offerings,
not persisted Products or automatic booking inventory.
`app/composables/useMountainMotion.ts` owns its animation listeners and cleanup.
`app/content/tours.ts` owns factual summaries of the operator’s five published
routes, with source URLs. Public copy uses operator activity names and facts,
not invented slogans, tour names or promotional narratives. The source map in
`docs/content-sources.md` records the page selection and price conflicts.
Published seasons and participant requirements are descriptive information,
not a live availability or reservation promise.

`app/content/tour-pages.ts` groups the five routes into four useful search
pages, combining Petersgrat’s Blatten and Stechelberg descents for comparison.
`app/pages/heliskiing/[slug].vue` owns route validation and composes `ToursDetail`.
The landing links to those pages. Core `useSeo` owns canonical, social and
robots metadata transport. App `utils/tour-seo.ts` projects visible operator
facts through Core’s connected graph builder; it adds no reviews, current
availability or unverified offers. Public contacts come from `content/operator.ts`.
Preview indexing stays disabled in App SEO configuration and Firebase Hosting;
Core filters all preview pages from its sitemap. Production launch requires a
reviewed domain and explicit changes to each indexing layer. The public route
inventory is declared through `seo.staticPaths`; no App-owned robots or sitemap
transport duplicates Core. Hero video uses metadata-only preload to prioritize
the static opening image, with native seeking loading the motion on demand.

The enquiry form calls `server/api/enquiry.post.ts`, delegating bounded input
validation and draft preparation to `server/utils/enquiry.ts`. It has no data
writer, reservation, Calendar call or automatic email delivery. The visitor
reviews and sends an email draft in their own mail client. A prepared draft is
not a received enquiry or a confirmed booking. Do not reuse a confirmation
lifecycle merely because the form resembles a booking flow.

The public `/operator` route composes App-owned `Operator/Index.vue` with
Slap's registered `SlapOperatorActivities`. The adapter projects the same
sourced tour catalogue into a searchable, filterable review UI shared with
Interlaken Bike Tours. It contains no private operator data or management
commands; existing Business/Bookings authority is unchanged.

## Authority and source

Current source and source-owned checks establish behavior. Daniel and the
operator own product decisions, artwork approval, pricing, contacts and launch.
`HANDOFF.md` and `TASK.md` retain the source brief from
`handoff/swiss-alpine-guides-heliski`; they do not grant deployment, branch or
data-mutation authority. Read them against current App source and instructions.
Interlaken Bike Tours is the source-verified Ben sibling. Inspect its actual
adapter before reusing mechanics; its confirmed-reservation semantics differ.

The identity master in `brand/prototype-mark.svg` is a concept placeholder.
The original photographic scene is retained in `brand/landing-v2/distance.png`.
The original generated ascent clip and its source frames are retained in
`brand/ascent-v1`. Runtime uses a silent, seek-optimized continuous MP4 and a
higher-quality static poster in `public/img/landing`. Scroll controls the native
paused video’s time; the App does not dissolve between separate still images.
The motion composable serializes decoder seeks and owns scroll smoothing and
text timing. The poster stays visible until decoded video is ready and remains
the reduced-motion and failure fallback.
Source provenance is documented beside the frames. Generated imagery is not
approved operator tour photography. Preserve supplied artwork and require explicit
direction before altering the absent approved portrait/helicopter assets.

## Refresh and verification

Re-read the App manifest, route, layout, API adapter and tests when changing
this flow. Follow the repository hierarchy/spine, App config, layouts,
components, brand-assets and Bookings maps for the relevant seam.
Use App `prepare`, `typecheck`, `test` and `build:release` commands;
run `test:seo` against the serving App for rendered metadata, connected graphs,
route links, 404s and preview sitemap/robots outcomes; run the
scoped asset audit and check mobile/desktop presentation. Verify API validation,
draft-only outcomes, route selection, reduced-motion handling and listener
cleanup. A successful build does not prove live email delivery or booking.
The manifest and `firebase.json` own the exact preview target; shared release
tooling owns artifact preparation and Rules readback. Deployment remains an
explicit action. No production launch or Rules/data change is implied.

## Living-context maintenance

Update this file with stable ownership, flow or verification changes in the
same edit. Point at current source rather than duplicating implementation.
Keep progress, temporary blockers, chat history and release snapshots in the
README or task report. Change global context only for a repo-wide rule change.
