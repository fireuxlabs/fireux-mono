# FireUX Design System — Codex Thread


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Draft**
Version: **v2**
Updated: 2026-02-07
Previous: v1 (2026-02-05)

This file is a Codex-owned working thread. It is **not canon** and should remain lean.
Promote decisions into GPT chat canon files once stabilized.

---

## 1. Scope (Current Knowledge)

- Nuxt 3 + Nuxt UI are the baseline UI primitives.
- The Richies tenant app is the most recently refined landing surface.
- Components and styles are tuned for clarity, speed, and clean typography.

---

## 2. Visual Language

- Clean, minimal surfaces with strong hierarchy.
- Primary actions are visually prominent and unambiguous.
- Cards and sections are clearly separated with soft dividers or spacing.

---

## 3. Color & Emphasis

- Primary action buttons use a blue brand treatment.
- Secondary actions are lower contrast and less prominent.
- Badges are used for status/metrics and should be compact.

---

## 4. Typography

- Short, confident headlines.
- Body text favors readability with generous line-height.
- Avoid excessive stylization; keep copy direct and scannable.

---

## 5. Layout & Structure

- Landing pages prioritize hero + CTA, followed by benefits, social proof, and FAQ.
- Navigation and footer are intentionally simple.
- Spacing is generous to keep sections breathable.
- Standardize page body spacing via `.pagebody` on `UPageBody` (no local `space-y-*` overrides).
- Global section styles live in `packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/sections.scss` and are imported in `packages/core/fireux-core/src/runtime/assets/styles/main.scss`.

---

## 6. Components in Active Use

- Page/section layout: `UPageCTA`, `UCard`, `USeparator`.
- User/media: `UUser`, `UAvatar`.
- Actions: `UButton` (primary blue), `UBadge`.
- Inputs: `UInput`, `UTextarea`, `USelect`, `UCheckbox`, `UCalendar`, `UPopover`.
- Feedback: toasts for transient confirmations.
- Content disclosure: `UAccordion`.

---

## 7. Motion & Effects

- Subtle background bubble effects are acceptable when soft and low-contrast.
- Motion should never obscure content; keep animation timing gentle.

---

## 8. Brand Assets

- Wordmark assets should use responsive `srcset` to avoid blurriness on mobile.
- Prefer crisp, high-resolution assets with proper sizing.

---

## 9. Accessibility Expectations

- Clear focus states on interactive elements.
- Button labels must be explicit; icons should be decorative unless semantic.
- Maintain readable contrast for primary actions and key text.

---

## 10. Known Implementation Patterns

- CTA buttons include direct actions (e.g., `tel:` for phone).
- Dates formatted using `@internationalized/date` for consistency.
- Keep global styling centralized and reuse Nuxt UI patterns.
- Use `UPageBody` with `class="pagebody"` instead of local `space-y-*` spacing hacks.

---

## 11. Card System (fx-card utilities)

Card styling is moving to shared utility classes in `scss/organisms/cards.scss`.

System rule:
- Card inheritance is linear: Pill → Cell → Preview → Profile (each builds on the previous).

Storage rule:
- Shared styles must live in `packages/core/fireux-core/src/runtime/assets/` (no ad-hoc copies).

Base wrappers:
- `.fx-card` (block, full width)
- `.fx-card--cell` (interactive list row)
- `.fx-card--pill` (compact pill surface)
- `.fx-card--preview` (card with overflow-hidden)
- `.fx-card--profile` (richer profile card surface)

Layout primitives:
- `.fx-card__media`, `.fx-card__content`, `.fx-card__header`
- `.fx-card__stack` with variants `--tight`, `--spaced`, `--loose`
- `.fx-card__badges`, `.fx-card__badge`, `.fx-card__badge--overlay`
- `.fx-card__title`, `.fx-card__title--lg`, `.fx-card__subtitle`, `.fx-card__tagline--empty`

Panels + details:
- `.fx-card__panel`, `--compact`, `__panel-title`, `__panel-value`, `__panel-subtitle`
- `.fx-card__panel-heading`, `.fx-card__detail-grid`, `.fx-card__detail-label`
- `.fx-card__label` (uppercase meta label)

Cover + media:
- `.fx-card__cover`, `__cover-image`, `__cover-gradient`, `__cover-content`
- `.fx-card__cover-title`, `__cover-meta`, `__cover-avatar`, `__cover-badges`

Collections + actions:
- `.fx-card__actions`, `__actions--tight`, `.fx-card__chips`, `.fx-card__gallery`, `__gallery-image`

Utility:
- `.fx-truncate`, `.fx-text-dim`, `.fx-card__icon`

Rule: prefer these classes over one-off Tailwind stacks for entity cards (e.g., Places).

Guidelines:
- Nuxt UI is the default; prefer minimal overrides (“less is more”).
- Local tweaks belong in component-scoped styles, not global utilities.

---

## 12. Open Items

- Formalize token naming (colors, spacing, radii) once stabilized.
- Document canonical component recipes (CTA blocks, hero layouts, testimonials).

#end
