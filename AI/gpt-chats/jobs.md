# FireUX Jobs — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Stable**
Version: **v2**
Updated: 2026-02-05
Previous: v1 (2026-02-04)

This file defines the **canonical scope, rules, and relationships** for the `fireux-jobs` extension.

Jobs is a **shared cross-ecosystem package** used by:
- Misebox (hospitality)
- Cleanbox (cleaning)
- Future FireUX ecosystems

Jobs is **not tenant-specific** and must remain ecosystem-agnostic.

---

## 1. What Jobs Is (and Is Not)

### Jobs IS
- A **listing and matching system**
- A connector between **real employers** and **real people**
- A shared workspace across ecosystems
- A package that owns job listings, visibility, and application flows

### Jobs IS NOT
- An employer
- A staffing agency
- A payroll system
- A contract issuer

FireUX must always remain **legally neutral**.

---

## 2. Core Roles in Jobs

Jobs always involves **three distinct roles**:

### Employer (external truth)
- The real-world employer
- Represented by a Company and/or Place
- Never FireUX itself
- Must be referenced on every job

Jobs always record:
- `company_id`

Workplace references are stored as:
- `workplace_type`
- `workplace_id`
- `workplace_label`

---

### Agent (posting authority)
- A **profile type owned by fireux-jobs**
- The identity allowed to post and manage jobs
- Represents the employer on the platform

Key rules:
- Jobs are posted **by Agents**
- Permissions are tied to having an Agent profile
- Agents may act on behalf of companies or places
- FireUX never auto-creates Agents

Canonical permission logic:
- `canPostJob === hasAgentProfile`

---

### Professional (candidate)
- A **profile type owned by fireux-jobs**
- Reusable across ecosystems (Misebox, Cleanbox, etc.)
- Represents the worker / applicant

Key rules:
- Professionals browse and apply to jobs
- Professional profiles are ecosystem-aware but portable
- Jobs never store copies of Professional data

---

## 3. Canonical Data Ownership

### Jobs Collection
Firestore:
```
jobs/{jobId}
```

Jobs own:
- Job metadata (title, description, status)
- References to employer entities
- Lifecycle state

Jobs never own:
- Employer identity truth
- Professional profile data
- Agent profile data

---

### Profiles Owned by Jobs

The Jobs package owns two profile types:

#### Agent
- Core document: `agents/{uid}`
- App overlay: `apps/{appId}/agents/{uid}`
- Identity + permissions + contact info

#### Professional
- Core document: `professionals/{uid}`
- App overlay: `apps/{appId}/professionals/{uid}`
- Skills, experience, certifications, languages

Profiles are **shared infrastructure**, not app-specific inventions.

---

## 4. Canonical Job Model (Runtime)

The Job model mirrors **stored Firestore shape only**.

Rules:
- No UI fields
- No computed fields
- No nested optional objects
- Empty string means “unset”

Runtime model (source of truth):

```ts
export const Job = {
  id: '' as string,

  // Ownership
  company_id: '' as string,

  // Workplace (v2)
  workplace_type: '' as string,
  workplace_id: '' as string,
  workplace_label: '' as string,

  // Product layer
  job_type: 'permanent' as JobType,

  // Hiring intent
  openings_count: 1 as number,

  // Pay
  pay_currency: 'CHF' as string,
  pay_rate: 0 as number,
  pay_unit: 'hour' as JobPayUnit,

  // Time window (optional by value)
  start_at: {} as FirebaseTimestamp,
  end_at: {} as FirebaseTimestamp,

  // Content
  title: '' as string,
  description: '' as string,

  // Lifecycle
  status: 'open' as JobStatus,

  // Auth
  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const
```

---

## 5. Workplace (v2 Decision)

### 5.1 The Key Change

Jobs **no longer reference kitchens directly**.
Instead, Jobs reference a **workplace** via:
- `workplace_type`
- `workplace_id`
- `workplace_label`

This enables reuse across ecosystems:
- Misebox (kitchens)
- Cleanbox (houses, offices)
- Logistics (trucks, ships, warehouses)

### 5.2 Legacy Handling

Legacy jobs with `kitchen_id` are resolved at read time.
The canonical model remains workplace-only.

---

## 6. Job Types (Product Layer)

```ts
type JobType =
  | 'einsatz'     // short-term / cover shift
  | 'misebox'     // platform-managed deployment
  | 'fixed'       // fixed-term contract
  | 'permanent'   // ongoing role
```

Rules:
- Affect product logic only
- Do not affect storage shape

---

## 7. JobResolved (Read-Time Only)

```ts
export type JobResolved = Job & {
  workplace?: unknown | null
}
```

Notes:
- `workplace` is never stored
- Type depends on ecosystem
- Misebox resolves workplace → Kitchen

---

## 8. Job Interface Rules (UI Mapping)

The interface layer maps **JobResolved → UI card**.

Rules:
- Do not invent missing data
- No synthetic subtitles
- No implicit address fallbacks
- If data is missing, it stays missing

---

## 9. Ecosystem Usage

### Misebox (current working context)
- Hospitality jobs
- Kitchens, restaurants, venues
- Early-stage usage with personal profiles and friends
- Competitive reference: Coople (market comparison only)

### Cleanbox
- Cleaning and facilities jobs
- Same job mechanics, different domain language
- No divergence in core Jobs logic

Rule:
> Ecosystems may customize **presentation**, never **core job logic**.

---

## 10. Job Lifecycle (Canonical)

Minimal, explicit states only:
- `open`
- `closed`

No hidden states.
No complex pipelines (for now).

---

## 11. Permissions & Safety

- Only Agents can create or manage jobs
- Professionals can view and apply
- Jobs always reference a real employer entity
- FireUX never appears as employer in UI or data

Language rules:
- Use “list”, “connect”, “apply”
- Avoid “hire”, “employ”, “contract”

---

## 12. Relationship to FireUX School

Historical context, experiments, and alternative designs live in **FireUX School**.

If:
- Job complexity grows unexpectedly
- Legal framing becomes unclear
- Roles feel overloaded

Then we may **pause and consult FireUX School** — but decisions land here.

---

## 13. Non‑Goals (Explicit)

Jobs will NOT:
- Handle payroll
- Handle contracts
- Mediate disputes
- Guarantee work
- Perform background checks

These are outside FireUX’s scope.

---

## 14. Final Principle

Jobs must remain:
- Simple
- Legally safe
- Ecosystem-agnostic
- Role-explicit

If complexity appears, it must be:
1. Justified by real usage
2. Explicitly added
3. Canonized here

Otherwise, it does not ship.

#end
