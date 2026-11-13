# Swiss Alpine Guides

Client-review heli-skiing / heliboarding prototype in the `slap` ecosystem.
A traditional public header sits above the image-led opening. Home, Tours,
Tour information and Contact links share native desktop/mobile navigation.
The hero headline reveals after scrolling. The scene scrubs a continuous camera-ascent video, with a sharp static poster
and a feathered exit into the tour section.

Source brief: `HANDOFF.md` and `TASK.md`, copied from the remote handoff branch
without switching, merging or cherry-picking. `fba4eaff` is the brief commit,
not an implementation commit. Durable scope: `docs/ai/swiss-alpine-guides-context.md`.

The App uses the standard `FireuxApp` root, App-local branded layout and named
landing sections. The mobile landing scrubs a continuous generated camera-ascent video with separate
scrolling text. Identity exports remain explicit concept placeholders. Approved portrait/helicopter assets were absent and are unchanged.
English is the provisional prototype language. Prices remain on request.

The form validates an enquiry on the server and returns an email draft. It does
not store contact details, send email, allocate capacity or confirm a booking.
The draft uses the published activity contact `heli1@swissalpineguides.ch`.
Tour facts, equipment, requirements and contacts are sourced from the operator’s
website; see `docs/content-sources.md`. Browser test details are synthetic.

Run `pnpm --dir projects/slap/swiss-alpine-guides dev` (port 3036).
Local `.env` needs `APP_DOMAIN` and the public `NUXT_FIREBASE_APP_ID` from the
existing Slap web binding. No new Firebase project, database or Auth owner exists.
The preview site is declared in `firebase.json`; release commands use
`tools/firebase-release` and the existing Slap development Rules readback.
All preview responses carry noindex policy.

Verification: App prepare/typecheck; `pnpm --dir projects/slap/swiss-alpine-guides test`;
`pnpm check:assets projects/slap/swiss-alpine-guides`; production release build;
mobile and desktop browser review. Device performance and real operator delivery
remain separate from the prototype's verified behavior.

## Verified preview

Deployed 2026-11-12: https://prototype-swiss-alpine-guides.web.app

Prepare, typecheck, four behavioral validation tests, all eight asset checks,
release build, local release preflight, IDE consistency and diff whitespace checks
passed. The live desktop landing and mobile enquiry draft were reviewed. The
prepared production function returned 200 for a valid synthetic enquiry and 400
for invalid group size or missing acknowledgement. No enquiry was sent or stored.
Reduced-motion handling and animation cleanup were inspected in source; real-device
performance is not certified. Deployment's transient Google service-identity error
cleared on one retry. The release tool verified existing live development Rules;
no Rules or database records were changed. Canonical App initialization is separate
from this anonymous client preview.

The primary preview uses the `prototype-` Hosting prefix. After a verified primary
release, `deploy:preview-alias` clones that exact Hosting version to the earlier
`swiss-alpine-guides-prototype` address, which shares the same SSR function.

### Photographic landing refresh

The preview serves the continuous photographic ascent. Mobile
and desktop crops, live image loading, full-width presentation and the scroll
progression were reviewed. The opening uses a static poster while the silent seek-optimized animation loads.
Runtime delivery uses a silent, seek-optimized 60 fps MP4. Its source resolution
is 720p; interpolation improves temporal sampling rather than restoring detail.
The App-local enquiry flow and its no-delivery/no-reservation behavior are unchanged;
no `fireux-bookings` integration was introduced.

## Operator activities preview

`/operator` composes `SlapOperatorActivities` with the same sourced tour catalogue
as the landing. Interlaken Bike Tours supplies its own catalogue to this shared
surface at the same route. Search, type filters and detail review use local UI
state. This public preview contains no customer records or live management commands.

The shared operator previews were deployed and reviewed on 2026-11-12 at
`https://prototype-swiss-alpine-guides.web.app/operator` and
`https://interlaken-bike-tours-prototype.web.app/operator`. Both App typechecks,
the Slap module build, Alpine enquiry tests and release preflights passed. Ben’s
13 rendered SEO checks passed against the deployed preview. Local mobile
search, empty-state recovery, selection and desktop detail layout were reviewed.
The Alpine video supports HTTP byte ranges (206) for native seeking.

## Search pages

The landing links to four factual tour pages under `/heliskiing/`: Ebnefluh,
Petersgrat (two descents compared), the Ebnefluh/Petersgrat combination and
Sustenlimi. App content supplies the page identities; Core’s `useSeo` supplies
canonical, robots and social metadata. A connected public business/site/page/
service graph uses visible source facts, with no fabricated offers or reviews.
The hero requests video metadata rather than preloading the complete clip.

Run `test:seo` with the App serving on port 3036, or set `ALPINE_TEST_ORIGIN`
to the preview URL. The rendered checks cover metadata, graphs, route identity,
404s, enquiry links and preview sitemap exclusion. Production indexing remains
disabled. See `docs/search-launch.md` for domain, legacy URL, content approval,
language and aggregate Search Console requirements before launch.
