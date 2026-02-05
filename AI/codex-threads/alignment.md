# Alignment Notes — use*Interface (2026-02-05)

Scope: `use*Interface` siblings across core + extensions, with emphasis on `useProductInterface`. This thread is about products; other notes are to align expectations and flag unwanted fallbacks.

## Canon (baseline expectations)
- Interfaces should be **deterministic** and **non-magical**: no “smart” fallback chains that hide missing data.
- Prefer **single-source fields** (explicit map from model fields) over “best-guess” fallbacks.
- `card()` should be the canonical minimal view model; `pill/cell/preview/profile` should not add hidden fallbacks unless explicitly required by UX.
- **Products must follow the canon**: keep `useProductInterface` minimal (name/description/image), avoid cascading fallbacks.

## Current Alignment Snapshot
**Lean interfaces (card + searchText only):**
- `useProductInterface`
- `useBlogInterface`
- `useJobInterface`
- `useAppInterface`
- `useUserInterface`

**Rich interfaces (card + pill/cell/preview/profile):**
- `usePlacesInterface`
- `useCompanyInterface`
- `useKitchenInterface`

**Profile interfaces (with hydration/secondary media):**
- `useAgentInterface`
- `useProfessionalInterface`

## Fallbacks to Flag (we don’t want these by default)
### Places
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ''`
- Preview defaults:
  - `source: target.source ?? 'fireux'`
  - `prop: brand_tagline || short_name || ''`

### Companies
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ''`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? 'fireux'`

### Kitchens
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ''`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? 'fireux'`

### Jobs
- Subtitle uses only `workplace.short_address` (empty if missing).

### Agent
- Headline/summary fallback chains:
  - `agent_headline || title`
  - `agent_summary || bio_short`
- Placement tags fallback:
  - `agent_placement_types || tags`
- Contact fallbacks:
  - `agent_contact_* || contact_*`

### Professional
- Display name depends on hydrated user (no fallback).
- Title uses `job_title` only (no extra fallback).

## Product Canon (keep it clean)
- `useProductInterface` should stay **lean**:
  - `title = name`, `subtitle = description`
  - `avatarUrl = main_image || images[0]`
  - no fallback chains for title/subtitle beyond direct model values
- If UX needs “nice” fallback behavior, put it **in the component** (not in the interface).

## Ecosystem vs App (locked)
Products (and blogs) are ecosystem defaults, resolved at app initialization, and configurable per app.
Default billing intervals live in `fireux-core` (`DEFAULT_PRODUCT_BILLING_INTERVALS`) and are referenced by ecosystems + product create UI.

Internal rule:
- Core enables.
- Ecosystems decide.
- Apps configure.

## Alignment To-Do (when we choose to act)
- Remove or minimize fallback chains in `pill/cell/preview/profile` for Places/Companies/Kitchens.
- Avoid defaulting `source` to `'fireux'` unless explicitly required by UI.
- Decide if Jobs subtitle should fall back to `workplace_label` or stay empty (current is empty).
- Keep Product interface minimal and explicit.

check all drift managers are working the same.

reall dev drift should only flag props that have fallen outside of the shape. so we can simplify the drift system by along way
