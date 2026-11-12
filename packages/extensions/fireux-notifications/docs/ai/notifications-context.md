# FireUX Notifications context

Updated: 2026-11-11
Role: living context

## Inheritance and authority

Inherits repository `AGENTS.md` and `docs/ai/gpt-context.md`. Current source and
checks establish behavior; the human retains product and sending authority.

## Purpose, scope and ownership

This Extension owns email message/transport contracts, local delivery state,
SMTP integration and neutral preview. Apps own recipient selection, content,
trigger authority, credentials and durable records. No public send endpoint,
Firestore ownership, WhatsApp adapter or production outbox is supplied.

## Source and consumers

Use the package README and manifest for public imports and limitations.
`src/runtime/utils/email-delivery.ts` owns process-local deduplication and retry
semantics. `src/runtime/server/smtp.ts` owns transport; SMTP acceptance is not
inbox delivery. The Vue preview is presentation only. Blank's notifications
sandbox and Docs' notifications component page use neutral inputs. Interlaken's
`server/utils/tour-booking-notifications.ts` owns its local booking composition.
Its dev API is unavailable outside development/local-test mode.

## Refresh and verification

Inspect contracts, transports and real consumers before changing ownership.
Run source-owned delivery tests and typecheck affected Apps. Exercise capture
and failure states; live sending additionally requires configured credentials
and explicit destination authority. Never infer delivery from a preview.

## Living maintenance

Update this context when supported channels, persistence, authority or consumers
change. Keep credentials, personal recipients, temporary task state and future
plans out of durable documentation. Route repo-wide changes through global
context only when they actually affect all packages.
