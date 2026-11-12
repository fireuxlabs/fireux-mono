# FireUX Notifications

Email-first capability: explicit message contract, process-local delivery ledger,
neutral preview and server-only Nodemailer SMTP transport. Imports are explicit;
there is no Nuxt module because this slice owns no automatic registration or routes.

- `runtime/types/email`: message, transport and delivery contracts.
- `runtime/utils/email-delivery`: validation, deduplication and explicit retries.
- `runtime/server/smtp`: encrypted SMTP transport; host supplies credentials.
- `runtime/components/Email.vue`: Nuxt UI preview, with no sending behavior.

`captured` means local only. `sent` means accepted by SMTP, not inbox delivery.
`unknown` means acceptance is uncertain and cannot be retried by this ledger.
Only a definite `EmailRejected` failure permits an explicit retry. No background
worker or automatic retries exist. The in-memory ledger deduplicates within one
process only, resets on restart and is intended for local previews/tests. Production
requires a durable outbox, atomic claim, retention and recovery at the consuming
record owner before these mechanics can be used reliably across workers.

Apps own templates, recipients, trigger authority, consent and sender settings.
Never expose SMTP credentials or arbitrary send commands to browser callers.
The package contains no Business, booking or named-App knowledge.

Consumers: Blank `/sandbox/notifications`, Docs `/docs/components/notifications`,
and Interlaken Bike Tours' development-only booking notification hook and preview.
WhatsApp is not implemented in this email slice.

Run `pnpm test:scope packages/extensions/fireux-notifications/src/test`.
