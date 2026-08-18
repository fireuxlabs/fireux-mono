export const MENU_CHOICE_EXTRACTION_INSTRUCTION =
  'Treat customer-facing alternative language as structured data. Words and phrases such as "or", "OR", "oder", "choice of", "choose one", and "served with X or Y" usually signal one required mutually exclusive selection. Examples: "with fries or rice" at price 24 becomes two price_options, Fries 24 and Rice 24; "chicken breast or chicken thigh" becomes two same-price price_options; and "coffee with Baileys or whiskey" becomes two same-price price_options. Repeat the full item price for every included choice, even when the source prints the price only once. Remove the choice phrase from description when the remaining prose is still useful. Do not turn an included choice into zero-price add_ons. By contrast, explicitly optional supplements such as "add fries +4", "extra rice 3", toppings, or separately priced additions belong in add_ons with only their incremental surcharge. Do not interpret ordinary prose, ingredient uncertainty, dietary warnings, translated duplicate text, or a slash joining translations as a customer choice. If the source is genuinely ambiguous, preserve its wording and add a review note instead of inventing options.'

const includedDescriptionChoicePatterns = [
  /\b(?:with|served with|comes? with|choice of|choose one|mit|wahlweise)\b[^.!?\n]{0,100}\b(?:or|oder)\b/iu,
  /^[^.!?\n]{0,80}\b(?:or|oder)\b[^.!?\n]{0,80}[.!?]?$/iu,
]

export const hasIncludedMenuChoiceCue = (input: {
  name?: unknown
  description?: unknown
}) => {
  const name = String(input.name ?? '').trim()
  const description = String(input.description ?? '').trim()

  return (
    /\b(?:or|oder)\b/iu.test(name) ||
    includedDescriptionChoicePatterns.some((pattern) =>
      pattern.test(description)
    )
  )
}
