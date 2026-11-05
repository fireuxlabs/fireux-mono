# FireUX Bookings

`fireux-bookings` provides a provider-independent booking lifecycle and server-side Google Calendar transport that domain packages and Apps can compose. Its first App consumer is Interlaken Bike Tours.

The current shared API exposes `queryGoogleCalendarBusy` and
`createGoogleCalendarEvent` from `fireux-bookings/runtime/server/google-calendar`.
FreeBusy returns Google's raw busy intervals. When using transport alone, the caller owns availability
policy, booking records, slot rules, transactional conflict handling, and
recovery if a Calendar write fails. Calendar event fields are an explicit
projection supplied by the owning domain.

The package accepts a calendar id and an access token from its server-side
consumer. It does not store credentials, choose a Google account, or expose a
universal Booking model. Property Reservations, Kitchen operations, and Jobs
retain their records and commands; consuming this package does not make those
domains depend on each other.

See [the living package context](docs/ai/bookings-context.md) for ownership,
authority, and verification boundaries.

## Reusable lifecycle

Import `confirmBooking` and `BookingError` from
`fireux-bookings/runtime/server/booking`. Supply a reservation and five adapters:
`reserve`, `verify`, `createEffect`, `confirm`, and `release`. Reservation must
atomically reject capacity conflicts. Verification runs after the reservation
and before the external effect. A conflict releases capacity. An uncertain
provider effect or failed finalization retains capacity for reconciliation.
The lifecycle never assumes a tour, daily schedule, price, currency, Firestore
collection, Google account or customer model.

Ben's App is the first integrated consumer. It owns tour policy, public API and
Firestore transaction adapters. The package tests also exercise a non-tour
appointment and failures at the reservation, provider and confirmation boundaries.
These fixture checks do not establish a second production integration.

Design and technical SEO remain supplied by Nuxt UI and FireUX Core. A future
Bookings storefront uses those same owners. This Extension does not introduce
its own design system, metadata engine or a dependency from Core into Bookings.

## Optional Business Workspace

Register `fireux-businesses` and `["fireux-bookings", { businessWorkspace: true }]` and explicitly extend
`fireux-bookings/layer` alongside `fireux-businesses/layer`. The optional route
`/workspace/business/bookings` reuses Business selection and authority. It provides
working days, closed dates, departure time and paged private booking records.
Business-scoped storage lives in `runtime/server/business`; service-specific
catalogue/pricing/timezone policy remains with the consumer. Existing reservation
domains do not move their records by importing Calendar transport.
