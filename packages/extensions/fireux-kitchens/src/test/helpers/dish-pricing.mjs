import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
const source = readFileSync(new URL('../../runtime/kitchen/utils/dish-pricing.ts', import.meta.url),'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'')
export const dishPricingHelpers = compileFunction(stripTypeScriptTypes(source)+';return {normalizeDishPriceOptions,normalizeDishAddOns,normalizeDishPricingPatch,readDishPricing}',['normalizeSlug'])(value=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))
