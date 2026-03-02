---
title: FireUX Alignment
status: active
created: 2026-01-13
updated: 2026-03-02
---

# FireUX Alignment
Authority: Tier2 (Operational)

Alignment means every layer agrees on responsibility and shape.

Not “everything looks the same”, but these things are consistent across the system:

- Data shape
- Naming
- Ownership
- Direction of dependency

When alignment is good, you can:

- Move faster without re-thinking
- Swap UI surfaces without breaking contracts
- Add a new domain (Jobs, Places, Products) without inventing rules again

## The 6 layers that must be aligned in FireUX

### 1) Model alignment (Firestore truth)

Each domain has:

- One canonical document
- Clear foreign keys
- No UI-specific fields leaking in

Example (Jobs):

```ts
Job {
  id
  posted_by_agent_id
  place_id
  company_id?
  kitchen_id?
  title
  description
  contract_type
}
```

Not allowed in the model:

- displayName
- cardTitle
- avatarUrl

Those belong elsewhere.

### 2) Interface alignment (view adapters)

Every domain exposes one interface:

- useJobInterface()
- useUserInterface()
- useAppInterface()
- usePlaceInterface()

Each interface is responsible for:

- card(raw)
- pill(raw)
- searchText(raw)
- label(raw) (optional)

This is where alignment lives most strongly.

If two cards look the same but are built differently, that’s misalignment.

### 3) Component alignment (dumb sections)

Organisms and sections:

- Do not shape data
- Do not invent fallbacks
- Accept already-aligned props

The Admin pattern is the canonical example:

- Sections are dumb
- Admin.vue orchestrates
- Interface guarantees card shape

### 4) Directory alignment (predictability)

If you see a path, you know what it contains.

Example:

- organisms/
  - App/Edit/
    - Admin.vue
    - Dev.vue
    - Sections/

- composables/fireux/firestore/core/app/
  - useApp.ts
  - mutations/
  - utils/view/

When directory structure mirrors mental structure, it’s aligned.

### 5) Responsibility alignment (who does what)

Quick test:

| Question | Correct owner |
| --- | --- |
| How does this render in a card? | Interface |
| Who can edit this? | Page / orchestration |
| How is this stored? | Model |
| How is this searched? | Interface |
| How is this laid out? | Section / organism |

If the answer is “this file does a bit of everything”, it’s misaligned.

### 6) Domain alignment (Jobs, Places, Users, Apps)

Each domain must:

- Follow the same lifecycle
- Use the same verbs
- Expose the same UI contracts

Jobs should feel like Apps, Users, Products — not special, not clever, predictable.

## What alignment is not

- Not over-abstracting
- Not DRY at all costs
- Not making everything generic
- Not premature optimisation

Alignment is about clarity, not cleverness.

## Rule of thumb (FireUX canon)

If you have to remember how something works, it’s not aligned.

Aligned systems are boring. Boring systems ship.
