# FireUX Products

Products owns the catalogue, public Product projections, protected Product
commands and optional Stripe Checkout integration. Apps opt in through the
`fireux-products` dependency, module and native layer; it is not a Core baseline.

## Checkout boundary

- `product/server/integration/stripe/checkout.ts` is the shared trusted checkout
  command. The public route passes only catalogue input; App-owned workflows may
  supply their server-validated return path, metadata and provider idempotency key.
- Checkout creation validates the public Product scope and its active provider
  price before asking Stripe to create a session.
- H3's native encrypted, HttpOnly session cookie remembers up to ten checkouts
  started by the current browser, for one day. This is independent of App login.
- `/api/stripe/checkout-status` checks that browser proof and returns only Stripe
  session/payment status, without customer details or metadata.
- `/api/stripe/checkout-session` retains its operator/service authorization.
- `/products/success` verifies status; reaching it does not prove payment or
  delivery. This package does not currently persist or execute fulfilment.

Stripe requires the consuming App's existing `STRIPE_SECRET_KEY` and installed
Stripe SDK. Key rotation invalidates browser checkout recovery. Recovery from
another browser remains an operator task; there is no public session-ID lookup.
The configured `APP_DOMAIN` owns return URLs. No webhook or live payment setup
is implied by installing this module.

See [repository instructions](../../../AGENTS.md), the
[runtime package map](../../../docs/concepts/runtime-package.md), and the owning
source under `src/runtime/product` and `src/runtime/server/api/stripe`.
Run the source-owned checks with
`node --test packages/extensions/fireux-products/src/test/*.test.mjs` from the
repository root, plus the consuming App's generated Nuxt typechecks.

Catalogue-only creation uses the same trusted Product command with an explicit
empty `priceInputs` array. It validates and creates the catalogue record atomically
without loading a payment provider. Non-empty prices retain the existing provider
reservation, retry and final catalogue/price transaction. A catalogue record is
not a payable offer until a provider price is deliberately configured.
