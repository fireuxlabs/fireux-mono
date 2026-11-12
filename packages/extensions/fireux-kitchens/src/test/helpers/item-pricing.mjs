import { normalizeItemChoiceGroups } from '../../runtime/kitchen/utils/item-choices.ts'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../../runtime/kitchen/utils/item-pricing.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
export const itemPricingHelpers = compileFunction(
  stripTypeScriptTypes(source) +
    ';return {normalizeItemPriceOptions,normalizeItemAddOns,normalizeItemPricingPatch,readItemPricing}',
  ['normalizeSlug', 'normalizeItemChoiceGroups']
)(
  (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  normalizeItemChoiceGroups
)
