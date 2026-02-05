# FireUX Design System — Codex Thread

Status: **Draft**
Version: **v2 (draft)**
Updated: 2026-02-05
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
- Standardize page body spacing via `.pagebody` (global section layout).

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
- Use `UPageBody` with `class="pagebody"` instead of local `space-y-*` hacks.

---

## 11. Recent Changes (Since v1)

- Added global section styles: `scss/organisms/sections.scss` is now imported in `main.scss`.
- Introduced `.pagebody` as the standard UPage body layout: flex column, `gap: 1.5rem`, `min-width: 0`.

---

## 12. Open Items

- Formalize token naming (colors, spacing, radii) once stabilized.
- Document canonical component recipes (CTA blocks, hero layouts, testimonials).
