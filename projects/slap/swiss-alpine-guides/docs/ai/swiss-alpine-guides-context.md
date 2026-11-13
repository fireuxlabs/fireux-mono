# Swiss Alpine Guides context

Updated: 2026-11-13
Role: living context
Scope: Swiss Alpine Guides App

## Inheritance and purpose

Inherit repository `AGENTS.md`, `docs/ai/gpt-context.md`, and the Apps That Slap
context at `packages/ecosystem/fireux-slap/docs/ai/apps-that-slap-context.md`.
Keep this App a complete source-backed Swiss Alpine Guides website: summer
and winter activities, courses, private groups, rentals, vouchers and enquiries.

## Ownership and boundaries

The App owns its routes, local scene composition, mountain motion, tour copy,
brand exports, enquiry validation and deployment target. `nuxt.config.ts`
selects the standard App bundle and Slap layer. `app/app.vue` delegates the
provider, page outlet, initialization and head lifecycle to `FireuxApp`.
The App-local `alpine` layout composes `NavigationHeader`, the accessible skip
link, native content slot and footer. The public header reuses native `UHeader`
and `UNavigationMenu` with Home, the seasonal activity catalogue, rentals,
vouchers, About and Contact;
Nuxt UI owns its mobile overlay and focus handling. The image-led opening
retains its small summit padding below the sticky header. Hero text appears
after scrolling; reduced motion presents that copy below the static image.
The motion coordinator accounts for the native header’s sticky inset, and
landing anchors retain space below it. Internal operator controls are not
part of this public navigation.
Core and reusable Bookings architecture remain with their package owners and
fireux-main; this App does not implement the architectural-reset handoff.

`app/pages/index.vue` composes Hero, the featured Activities Collection and
Landing Explore. The rounded activity panel overlaps the closing mountain
scene; the motion coordinator fades the closing copy as the panel arrives.
The opening animation and summit framing remain App-owned. Reduced motion
uses a normal document flow.

`app/content/activities.json` owns the sourced activity families, programme
facts, original photo provenance, published date references and source warnings.
`activities.ts` exposes their types and featured selection. `Activities/Collection`
owns seasonal filtering and search; `Activities/Card` owns each catalogue item;
`Activities/Detail` owns programme presentation. The thin `/activities/[slug]`
route validates source-owned slugs. Summer, Winter and Courses are bounded
catalogue projections, not new data readers. Older rafting and canyoning
references remain labelled as unconfirmed original-site listings. They do not
emit a current Service claim. No programme is live booking inventory.

The existing `tours.ts`, `tour-pages.ts`, `ToursDetail` and `/heliskiing/[slug]`
retain the five heli routes and four detailed search pages. Petersgrat compares
the two descents. `LandingTours` is now part of the heli activity page rather
than the whole website's catalogue. Copy uses original activity names and facts,
not invented slogans, testimonials, guide biographies or availability claims.

`site-information.ts` owns the sourced rentals, vouchers, About, programme
updates, resources and terms summaries; `Information/Detail` presents them.
Original English and German source links remain visible. Reference prices,
conflicting meeting points and past or inconsistent calendar entries are
explicitly distinguished from current quotes and bookable dates. Terms summaries
link to both full originals and do not create a new booking acceptance flow.
`docs/original-source-inventory.json` records the inspected source URLs and
coverage; `docs/content-sources.md` explains source authority and discrepancies.

Core `useSeo` owns canonical, social and robots metadata transport.
`app/utils/site-seo.ts` projects visible business/site/page facts through Core's
graph builder, with bounded catalogue lists and service breadcrumbs. It emits no
unverified price offers or ratings. Public contact facts come from `operator.ts`.
Preview indexing stays disabled in App configuration and Firebase Hosting;
Core filters those pages from its sitemap. A production domain and explicit
launch remain separate. The App declares public paths through `seo.staticPaths`
and has no competing robots or sitemap transport.

The enquiry form calls `server/api/enquiry.post.ts`, delegating bounded input
validation and draft preparation to `server/utils/enquiry.ts`. It has no data
writer, reservation, Calendar call or automatic email delivery. `enquiry-options.ts` supplies the same bounded choices to the UI and server:
heli requests use the heli contact; other activities, rentals and vouchers use
the general office. The server selects the recipient, validates the request and
returns the draft. The visitor reviews and sends it in their own mail client. A prepared draft is
not a received enquiry or a confirmed booking. Do not reuse a confirmation
lifecycle merely because the form resembles a booking flow.

The public `/operator` route composes App-owned `Operator/Index.vue` with
Slap's registered `SlapOperatorActivities`. The adapter projects the same
sourced activity catalogue and heli routes into a searchable, filterable review UI shared with
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
run `test:site` and `test:seo` against the serving App for rendered metadata, connected graphs,
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
