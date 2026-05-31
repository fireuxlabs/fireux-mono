Authority: Tier2
Updated: 2026-05-30

# Yellow Velo Project Init

## Intent

Create a Slap-hosted tenant identity website for Yellow Velo. The site should
preserve the current SEO/commercial intent from `yellow-velo.ch`, then improve
design, photography, and commerce execution through the Slap ecosystem.

## Starting Shape

- Tenant identity app in the Slap ecosystem: `projects/slap/yellow-velo`.
- Public website and commerce first.
- Keep the first version useful, but treat WooCommerce migration as a controlled
  ecommerce/SEO migration rather than a visual-only rebuild.
- No complex marketplace, booking, repair, or membership system in the first pass
  unless explicitly requested.
- Use `docs/yellow-velo-seo-commerce-baseline.md` before changing current URL,
  SEO, product, category, brand, or commerce behavior.

## Public Website

Initial website surfaces may include:

- Home
- About
- Custom / vintage bikes
- Rentals
- Tours
- Workshop services
- Shop
- Photography / rides / journal if Tommy's owned images support it
- Contact
- Location / visit information
- Terms or privacy if needed

The site should feel local, practical, friendly, bike-shop specific, and more
modern/lifestyle-led than the current WordPress theme.

## Go QR Connection

Yellow Velo can later consume Go QR Text as a primitive for lost-and-found stickers.

Example use case:

- A customer creates a short recovery message.
- Go QR turns the message into a QR code.
- Yellow Velo provides the bike-shop branded sticker flow.
- The sticker can be placed on a bike, helmet, bag, lock, or keys.

Go QR owns:

- Text QR primitive
- `/api/tools/text` provider contract
- QR generation
- Generic print/sticker mechanics if they become reusable

Yellow Velo owns:

- Bike-shop meaning
- Customer/member area
- Bike record or owner context
- Shop workflow
- Branded lost-and-found sticker experience

## Thin Consumer Pattern

Yellow Velo should consume Go QR Text through the provider API, not by copying Go QR internals.

Start with the smallest pattern:

```ts
const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const { data } = await useFetch(`${providerBaseUrl}/api/tools/text`)
```

Then render the contract inside a Yellow Velo-owned component.

Keep the first consumer intentionally thin:

- Yellow Velo page owns bike-shop wording.
- Yellow Velo component fetches the Go QR Text contract.
- Go QR owns the text QR primitive.
- Do not copy Go QR tool frames, registries, or upload logic into Yellow Velo.
- Add shared helpers only after two or more real consumers need the same code.

## Later Member Area

Possible member features:

- Customer sign-in
- Bike profiles
- Lost-and-found QR sticker records
- Contact/recovery preferences
- Optional privacy controls
- Optional reward or message handling
- Shop-managed sticker printing

## Notes

- This is only a project seed note.
- Do not build during Go QR/Misebox cleanup.
- Revisit after the Go QR Text primitive is stable enough to consume.
