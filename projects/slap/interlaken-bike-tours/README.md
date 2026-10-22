# Interlaken Bike Tours prototype

FireUX visitor App assembled using the FireUX Ignite method. The App-owned
[brief and assembly](app/ignition/brief.ts) define the bounded journey and configured
Apps That Slap identity consumed by `defineFireuxConfig`.

- `pnpm dev`: local preview on port 3035.
- `pnpm build`: compile the FireUX runtime for Firebase SSR.
- `pnpm typecheck`: check Vue and TypeScript sources.
- `firebase.json`: dedicated prototype Hosting site and App-owned SSR function.

Core, Slap and Blogs are registered through their native runtime layers. Core
owns Firebase integration, shared account/management routes, configured App
initialization, SEO and the versioned PWA manifest. App-owned public tour pages
use the `tours` layout; shared runtime routes retain their owning layouts.
Enquiry controls open a prepared WhatsApp/email draft; they do not persist
bookings or send messages. No booking Workspace is implemented.

Local `.env` requires `APP_DOMAIN` and this App's `NUXT_FIREBASE_APP_ID`.
Firebase web identity: `1:884456976096:web:a44e8e83518ee57f0d2a85`.
Infrastructure: project `slap-45389`, database `slap`, region `europe-west1`.
App initialization uses Core's authenticated trusted command. The configured
App and initial developer membership are initialized in the owning database;
operator booking journeys remain outside this visitor prototype.

Content and bundled photos were inspected from the existing business website on
2026-10-21. Sources: [home](https://www.interlakenbiketours.com/),
[Panorama](https://www.interlakenbiketours.com/interlaken-panorama-tour),
[Lauterbrunnen](https://www.interlakenbiketours.com/lauterbrunnen-valley-tour),
[guide](https://www.interlakenbiketours.com/about-us), and
[contact](https://www.interlakenbiketours.com/contact-8).
The homepage establishes the Giessbach duration and price; unverified distance,
elevation, difficulty and inclusions are omitted. Ratings were inconsistent across
source pages and are not reproduced. Review facts, photography permissions,
pricing, contact routing and policies with the operator before public release.

The landing composes Hero, Rides, Guide and Enquiry. Tour content has one owner in
`app/content/tours.ts`; cards and detail pages consume it. The enquiry component
owns its local draft only. No reusable cycling domain is claimed or extracted.

PWA metadata is served by Core at `/manifest.webmanifest` from the configured
App identity and palette; there is no competing static manifest. Icons in `public/img/app/pwa` are resized exports of the original
business logo (source: the existing site, Wix media
`a7aafb_b2d699a1140641ed8892f9dca953c004~mv2.png`). The maskable export adds safe
white padding. The favicon uses the existing mountain/bicycle artwork.

Core `/install`, linked from the shared footer, provides native installation
where available and manual browser instructions otherwise. Its installed status
describes the current window. Offline support is a separate explicit choice:
Core stores an App-specific preference and caches only a self-contained reconnect
HTML page. Live App pages/data, API/auth responses and queued writes are excluded;
live data and actions need a connection. Fresh visits create no PWA registration
or cache; later visits may resume the saved choice. Disable offline support
removes the preference, owned worker and cache, while Update and reload
deliberately applies a waiting worker. An already-open page may retain worker
control until reloaded or closed. Shared behavior is owned by Core
`src/config/app/pwa.ts`, `src/runtime/utils/pwa-controller.ts`,
`src/runtime/components/Pwa` and `src/test/pwa.test.mjs`.

The public layout consumes Core `LayoutsSharedPlatformFooter` for FireUX attribution
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
