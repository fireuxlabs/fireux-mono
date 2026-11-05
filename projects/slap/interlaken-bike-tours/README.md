# Interlaken Bike Tours prototype

FireUX visitor App assembled using the FireUX Ignite method. The App-owned
[brief and assembly](app/ignition/brief.ts) define the bounded journey and configured
Apps That Slap identity consumed by `defineFireuxApp`.

- `pnpm dev`: local preview on port 3035.
- `pnpm build`: compile the FireUX runtime for Firebase SSR.
- `pnpm typecheck`: check Vue and TypeScript sources.
- `firebase.json`: dedicated prototype Hosting site and App-owned SSR function.

For the existing noindex preview, run `pnpm build:release`,
`pnpm deploy:preflight`, then `pnpm deploy:preview`. The release build uses the
preview's HTTPS origin and this App's Firebase web identity from the build
environment. The preview function uses Firebase-provided runtime settings and
the reviewed [runtime environment](server/firebase.runtime-env.json). Upload
checks the deployed Slap development Rules against the ecosystem template before
updating the preview's Hosting site and SSR codebase.

Core and Slap are registered through the App's native runtime layers. The App
also directly registers `fireux-bookings` for its server-side Google Calendar
adapter in `server/utils/tour-calendar.ts`. The visitor booking page checks a
configured departure (09:00 by default) against Ben's calendar, working days, closed dates and a Business-scoped daily booking lock. It composes the shared `confirmBooking` lifecycle with an App-owned tour adapter, Business-scoped storage and Calendar integration, then inserts the Calendar event before showing an
on-screen confirmation. Current catalog prices are fixed per person. There is
no payment, confirmation email or cancellation flow. The Business Workspace manages availability and shows booking records. A provider failure after event creation begins retains the pending reservation for manual reconciliation and returns its booking reference. Do not retry it until the operator has reconciled Calendar and storage.
Google Calendar refresh credentials and the calendar id are server-only
environment settings: `BOOKINGS_GOOGLE_CALENDAR_ID`,
`BOOKINGS_GOOGLE_CLIENT_ID`, `BOOKINGS_GOOGLE_CLIENT_SECRET` and
`BOOKINGS_GOOGLE_REFRESH_TOKEN`. Store secrets in the server environment, never
browser config or committed files.

The `fireux-app` bundle supplies Blogs and Products. Core owns Firebase integration, shared
account/management routes, configured App initialization, SEO and the versioned
PWA manifest. App-owned public tour pages
use the `tours` layout; shared runtime routes retain their owning layouts.
Enquiry controls open a prepared WhatsApp/email draft; they do not persist
enquiries or send messages. `/book` is the separate instant-confirmation flow.

Local `.env` requires `APP_DOMAIN` and this App's `NUXT_FIREBASE_APP_ID`.
Firebase web identity: `1:884456976096:web:a44e8e83518ee57f0d2a85`.
Infrastructure: project `slap-45389`, database `slap`, region `europe-west1`.
App initialization uses Core's authenticated trusted command. The configured
App and initial developer membership are initialized in the owning database;
operator booking management remains outside this visitor prototype.

Content and bundled photos were inspected from the existing business website on
2026-10-21. Sources: [home](https://www.interlakenbiketours.com/),
[Panorama](https://www.interlakenbiketours.com/interlaken-panorama-tour),
[Lauterbrunnen](https://www.interlakenbiketours.com/lauterbrunnen-valley-tour),
[Giessbach](https://www.interlakenbiketours.com/giessbach-waterfalls-tour),
[guide](https://www.interlakenbiketours.com/about-us), and
[contact](https://www.interlakenbiketours.com/contact-8).
The Giessbach card and detail page use the route facts from the business's
Giessbach page. Ratings were inconsistent across source pages and are not
reproduced. Review facts, photography permissions, pricing, contact routing
and policies with the operator before public release.

The landing presents the tour comparison, reasons to ride, bike rental,
destinations, guide and enquiry. Tour content has one owner in
`app/content/tours.ts`; cards and detail pages consume it. The enquiry component
owns its local draft for rental, bespoke and direct enquiries. Tour details and
the homepage CTA open `/book` for fixed-price booking.

PWA metadata is served by Core at `/manifest.webmanifest` from the configured
App identity and palette; there is no competing static manifest. Icons in `public/img/app/pwa` are resized exports of the original
business logo (source: the existing site, Wix media
`a7aafb_b2d699a1140641ed8892f9dca953c004~mv2.png`). The maskable export adds safe
white padding. The favicon uses the existing mountain/bicycle artwork.

Core `/legal#browser-storage` gives browser installation instructions and
contains the collapsed app-specific install and offline controls. Its installed status
describes the current window. Offline support is a separate explicit choice:
Core stores an App-specific preference and caches only a self-contained reconnect
HTML page. Live App pages/data, API/auth responses and queued writes are excluded;
live data and actions need a connection. Fresh visits create no PWA registration
or cache; later visits may resume the saved choice. Disable offline support
removes the preference, owned worker and cache, while Update and reload
deliberately applies a waiting worker. An already-open page may retain worker
control until reloaded or closed. Shared behavior is owned by Core
`src/config/app/pwa.ts`, `src/runtime/composables/pwa/controller.ts`,
`src/runtime/components/Pwa` and `src/test/pwa.test.mjs`.

The public layout uses the Core header, with Blog and Products available in its
navigation. It consumes Core `FireLayoutsSharedPlatformFooter` for FireUX attribution
and platform disclosures, and exposes the shared account entrance. Home and tour
pages use Core SEO composables for canonical URLs, social previews and JSON-LD.
The prototype deliberately configures noindex/disallow policy; Core filters its
sitemap accordingly. Indexability is a release choice, not a claim about ranking.

The App-owned `app/ignition/search.ts` is consumed by the brief, Nuxt SEO config
and public page metadata. Ignition reviews its declared origin, journeys and
index/sitemap consistency. The reviewed prototype origin is
`https://interlaken-bike-tours-prototype.web.app`; it must not inherit a local
APP_DOMAIN into canonical identity. English is the sole crawlable language;
spoken guide languages do not establish translated pages. Search measurement
is planned, not connected. The existing business website remains the public
reference until a separately approved launch and migration.

After building and serving the production output locally, run `pnpm test:seo`
(default origin `http://127.0.0.1:3035`; override with `BIKE_TOURS_TEST_ORIGIN`).
These checks verify rendered canonical/noindex/social metadata, preview sitemap
exclusion, missing-tour status, manifest identity and the generated robots file.
They do not establish public deployment or search performance.

Run `pnpm test:bookings` for the local booking/Calendar boundary checks. The
tests use an in-memory booking store and mocked Google responses; they do not
write the App's Firebase database or Ben's Calendar.

## Business Workspace

The App registers `fireux-businesses` and its native layer. The authenticated
`/workspace/business` entrance uses Core Workspace framing and provides business
profile/contact details, explicit Place links and the shared Team roster editor.
Creating a Business uses current App membership, its configured capacity and an
atomic root/Team/access command. Team roster entries do not grant account access.
The Business can use Free. No Ben Business record is created by a source build.
Legacy Company data requires the reviewed migration plan before releasing the
new source against an existing Company-backed database.

## Booking management

Enable the Bookings Business Workspace module option and native layer to expose
`/workspace/business/bookings`. The selected Business's current membership-bound
authority protects availability changes and private booking/guest reads. Operators
set working weekdays, departure time and individual closed dates. Closing a day
does not cancel an existing reservation. Concurrent schedule edits require refresh.
The list supports cursor pages and manual refresh.

Set server-only `BOOKINGS_BUSINESS_ID` to Ben's actual Business document id before
accepting public bookings. The public browser cannot choose that owner. New records,
settings and locks live beneath that Business. Legacy `interlaken_tour_bookings`
and `interlaken_tour_booking_days` are not read or automatically migrated.
Google Calendar credentials are still required for live availability and events.
