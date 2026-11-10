# FireUX Bookings

Reusable booking presentation, provider-independent lifecycle coordination and
server-side Google Calendar transport for consuming domains and Apps.

## Customer booking surface

`runtime/components/Surface.vue` composes time selection, contact details,
review and confirmation. Supply a `BookingConfiguration` and a
`BookingConfirmationHandler` from `runtime/types/booking-surface`:

```vue
<BookingsSurface :configuration="offer" :confirm="confirmBooking" />
```

The configuration is `{ title, slots: [{ id, startAt, endAt }] }`; time values
are local `YYYY-MM-DDTHH:mm` strings whose timezone meaning belongs to the host.
The handler receives `{ requestId, slotId, contact: { name, email } }` and
returns `{ reference }` after authoritative confirmation. It must validate the
offer, availability, authority, allocation and persistence for its domain.
Use `requestId` for idempotency, including retries after uncertain results.
A rejected promise keeps the customer on review and presents the handler's
user-facing error message. Obsolete completions are ignored in the interface;
host-side reconciliation remains with the handler.

The surface requires Vue and Nuxt UI, with no page shell or Workspace selection.
The Bookings Nuxt module registers `BookingsSurface`; hosts without that module
can import the component directly. Blank demonstrates configurable inputs and
local receipts at `/sandbox/bookings`. Docs supplies a neutral interactive
preview at `/docs/components/bookings`. Neither preview writes durable records.

## Existing customer form

The module registers `BookingsCustomerForm` from
`fireux-bookings/runtime/components/Customer/Form.vue`. It presents customer
name, email, group size, availability feedback, errors and confirmation. Its
`reservation`, `availability-actions`, `summary`, `footnote` and
`confirmation-actions` slots let an App render its own reservation inputs and
actions around those shared customer fields. `headingLevel` lets a page select
an appropriate heading level for the form's placement.

The form accepts `BookingCustomerDetails`, `BookingAvailabilityView` and
`BookingConfirmationView` from
`fireux-bookings/runtime/types/customer-booking-form`. It emits customer edits
and a submit event; it does not fetch availability or submit a booking. The
consuming App owns service choices, schedules, prices, calendar policy, records,
and booking commands. Interlaken Bike Tours currently consumes this form.
Blank and Docs consume `BookingsSurface` described above; the existing form
remains a separate contract for its maintained App consumer.

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

Consuming Apps own service policy, public APIs and storage adapters. The package
tests exercise a non-tour appointment and failures at the reservation, provider
and confirmation boundaries. These fixture checks do not establish another
production integration.

Design and technical SEO remain supplied by Nuxt UI and FireUX Core. The
Extension does not introduce its own design system, metadata engine or a
dependency from Core into Bookings.

## Optional Business Workspace

Register `fireux-businesses` and `["fireux-bookings", { businessWorkspace: true }]` and explicitly extend
`fireux-bookings/layer` alongside `fireux-businesses/layer`. The optional route
`/workspace/business/bookings` reuses Business selection and authority. It provides
working days, closed dates, departure time and paged private booking records.
Business-scoped storage lives in `runtime/server/business`; service-specific
catalogue/pricing/timezone policy remains with the consumer. Existing reservation
domains do not move their records by importing Calendar transport.
