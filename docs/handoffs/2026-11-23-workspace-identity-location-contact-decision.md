# Workspace Identity — Place and contact resolution (discussion handoff)

Date: 2026-11-23
Status: User-approved direction for documentation and Codex review; not a migration instruction.

## Decision

Within Workspace Entity Identity navigation, provide **Location** because a Workspace Entity may link to a Place. Keep **Profile**, **Brand**, **Location**, and **Publication** as proposed navigation groups; do not conflate navigation with persisted schema.

Use an optional Place relationship and optional directly owned contact details. When an Entity has a linked Place, display the Place's available address/contact information; do not copy it into the Entity. When there is no Place, display the Entity's own optional contact details. If neither exists, no location/contact information is available. Place has precedence as a resolution source, but the precise fallback behavior for partially populated Places and the policy for existing manual values on linking/unlinking need explicit review.

Illustrative concept only (not a universal storage migration):

```ts
type EntityLocationContact = {
  placeId?: string
  contact?: {
    address?: string
    phone?: string
    email?: string
    website?: string
  }
}
```

Do not force the illustrative shape into every model: Kitchen currently uses `placeId`, Property `place_id`, Business `place_ids[]`, and Supplier's identity is linked through Business/Place. Existing Business has its own email/phone/website. Place owns its canonical address, email, phone, website and social links. Preserve real cardinality and domain ownership. Do not create an embedded fake Place or a duplicate Place document.

## Codex follow-up

Audit six Workspace Entity families and the existing Place readers, ownership, update commands and public projections. Propose the smallest shared **read/resolution** interface and navigation treatment; distinguish optional Place links from required links (Property currently requires Place), multiple Places (Business), and no direct Place link. Clarify whether contact should remain an independent section for Business or be shown within Location. Audit before implementing. No live writes or migrations authorized.

Related: `docs/handoffs/2026-11-23-walk-mode-workspace-identity-common-contract.md` and `docs/handoffs/2026-11-23-workspace-entity-alignment.md`.
