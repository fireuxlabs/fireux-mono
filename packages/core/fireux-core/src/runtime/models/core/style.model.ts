/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: public pages or scoped surfaces that need simple visual tokens
 *
 * Decision note:
 * - PageStyle is a small reusable style token shape.
 * - `*_light` means the value used in light mode; `*_dark` means the value
 *   used in dark mode. It does not mean light-coloured or dark-coloured.
 * - Domain models may store a `style` field using this shape, but should not
 *   define their own copy of these page-level color tokens.
 */
export type PageStyle = {
  background_color_light: string
  background_color_dark: string
  font_color_light: string
  font_color_dark: string
  primary_color: string
  secondary_color: string
}
