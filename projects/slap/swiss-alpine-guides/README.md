# Swiss Alpine Guides

Complete source-backed client-review website for the operator’s summer and winter
activities, courses, rentals, gift vouchers, private groups and contact enquiries.
The original mountain-ascent landing and traditional navigation remain.

The App uses `FireuxApp`, native Nuxt UI and Core SEO transport. App content owns
17 activity families and 44 non-heli programmes, plus five heli routes. Original
activity photographs, English/German source links and conflicting published facts
are recorded in `app/content/activities.json` and `docs/content-sources.md`.
`docs/original-source-inventory.json` records the source audit. Older rafting and
canyoning references are retained as unconfirmed listings. Historical schedules
and reference prices are distinguished from current quotes and availability.

Public routes include Home, Activities, Summer, Winter, Courses, every activity,
heli detail pages, Rentals, Vouchers, About, Programme updates, Resources, Terms
and Contact. `/operator` remains a separate public-data UI preview with no live
management commands. Its Slap surface is shared with Interlaken Bike Tours.

The shared enquiry command validates activity/contact data and returns an email
draft addressed to the appropriate published operator contact. It does not store
customer data, send email, allocate inventory, take payment or confirm bookings.
The visitor reviews and sends the draft through their mail client.

Run App `dev` on port 3036, `typecheck`, `test`, `test:seo`, `test:site`, and
`build:release`. Rendered tests require the serving App; set `ALPINE_TEST_ORIGIN`
for the deployed preview. Release commands use the existing Slap Firebase project,
artifact tooling and development Rules readback. They do not change Rules or live
business records. Preserve unrelated work in the shared checkout.

Preview: https://prototype-swiss-alpine-guides.web.app
Earlier alias: https://swiss-alpine-guides-prototype.web.app

The preview remains noindex. Production hostname, operator content approval,
legacy URL migration, reviewed multilingual routes and Search Console measurement
remain explicit launch decisions; see `docs/search-launch.md` and the App context.
