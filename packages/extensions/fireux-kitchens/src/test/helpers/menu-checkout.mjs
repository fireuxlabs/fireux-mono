import {
  loadOfferingSource,
  serviceHoursPolicy,
  weekdayHoursConstraints,
  testKitchenHours,
} from '../offering-test-helpers.mjs'
import { dishPricingHelpers } from './dish-pricing.mjs'
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const requireFirestoreDocumentId = (value) => {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('/') ||
    ['__proto__', 'constructor', 'prototype', '.', '..'].includes(value)
  )
    throw new Error('Invalid ID')
  return value
}
export const checkoutPricing = loadOfferingSource(
  'kitchen/utils/promotions/pricing',
  'normalizeKitchenPromotion,promotionPricedItem,promotionDay'
)
export const checkoutBasket = loadOfferingSource(
  'menu/utils/service-basket',
  'serviceBasketLine,serviceItemSignature'
)
export const checkoutSelections = loadOfferingSource(
  'menu/server/ordering/selections',
  'readMenuOrderSelections',
  { createError, requireFirestoreDocumentId }
)
export function makeMenuOrdering(deps) {
  const common = {
    createError,
    requireFirestoreDocumentId,
    ...dishPricingHelpers,
    ...checkoutPricing,
    ...checkoutBasket,
    ...checkoutSelections,
    ...serviceHoursPolicy,
    resolveKitchenOperationHours: testKitchenHours,
    ...deps,
  }
  const items = loadOfferingSource(
    'menu/server/ordering/items',
    'orderItemReader',
    common
  )
  const menuHours = loadOfferingSource(
    'menu/utils/menu-hours',
    'constrainMenuOfferings',
    {
      normalizeKitchenOfferings: (rows) => rows,
      readWeekdayTimeWindowsConfig: (value) => value,
      ...weekdayHoursConstraints,
    }
  )
  return loadOfferingSource(
    'menu/server/ordering',
    'readMenuOrderSelections,resolveMenuOrderLines',
    { ...common, ...items, ...menuHours }
  )
}
