# FireUX Places — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Stable**
Version: **v2**
Updated: 2026-02-07
Previous: v1 (2026-02-04)

This file defines the **canonical scope, rules, and responsibilities** for the `fireux-places` extension.

Places is a **shared cross-domain infrastructure package** used by:
- Jobs
- Companies
- Kitchens
- Venues
- Future FireUX domains

Places must remain **foundational, neutral, and boring**.

---

## 1. What Places Is (and Is Not)

### Places IS
- A **canonical real-world location layer**
- A system for deduplicating physical locations
- A shared reference used by many domains
- A long-lived truth source for addresses and geography

### Places IS NOT
- A business profile
- A company identity
- A job posting
- A content system

A Place answers: **“Where is this?” — nothing more.**

---

## 2. Canonical Identity

### Stable IDs
- Every Place has a stable `id`
- When sourced from Google, this is the **Google Place ID**
- This prevents duplicates across tenants and apps

Rule:
> One real-world location = one Place document.

---

## 3. Data Ownership

### Places Collection
Firestore:
```
places/{placeId}
```

Places own:
- Address & formatted address
- Geo coordinates (lat/lng)
- Country / region
- Basic contact fields
- Place image & image shade
- Source metadata

Places do NOT own:
- Business logic
- Employment data
- Ownership or admin rights
- Domain-specific metadata

---

## 4. Relationship to Other Domains

Places are **always referenced**, never embedded.

### Jobs
- Jobs reference Places to indicate work location
- Jobs never copy address or geo data

### Companies
- Companies may reference Places as locations or headquarters
- Company identity is separate from Place identity

### Kitchens / Venues
- Kitchens attach to Places
- Multiple kitchens may exist at one Place

Rule:
> Places are the ground. Domains build on top.

---

## 5. Google Ingestion Rules

### Search & Creation
- Google Places API is used for search and validation
- Creation happens **once**, then reused everywhere
- Google icon URLs must **never** be persisted

### Normalization
External data is:
- Normalized
- Stripped of unnecessary fields
- Stored with consistent defaults

Places may optionally be refreshed via scripts, but **never silently mutate**.

---

## 6. Media & UI Rules

### Images
- Places may have a logo or hero image
- `image_shade` is **required**
- Default value: `none`

Rule:
> Image legibility is a UI concern, not a styling hack.

### Pills vs Cards
- Pills are dumb (id + name only)
- Cards may hydrate media
- Media decisions must be consistent across domains

---

## 7. Tenant & Ecosystem Behaviour

- Places are shared across ecosystems (Misebox, Cleanbox, etc.)
- Tenants may reference the same Place without duplication
- Tenants do not fork Place data

Presentation may vary. **Truth does not.**

---

## 8. Safety & Non-Goals

Places will NOT:
- Decide ownership
- Handle claims or disputes
- Sync live business hours continuously
- Act as a social profile

Those belong elsewhere.

---

## 9. Relationship to FireUX School

Historical experiments and alternative designs live in **FireUX School**.

If complexity arises around:
- Sync strategies
- External data trust
- Ownership semantics

We may consult FireUX School, but decisions land here.

---

## 10. Final Principle

Places must remain:
- Stable
- Reusable
- Low-churn
- Dependency-safe

If Places become exciting, something has gone wrong.

#end
