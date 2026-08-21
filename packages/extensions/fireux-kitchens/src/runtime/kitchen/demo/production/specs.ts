import { deanosKitchenDemoCoreSpecs } from './specs/core'
import { deanosKitchenDemoPartySpecs } from './specs/party'
import { deanosKitchenDemoSeasonalSpecs } from './specs/seasonal'
import type { KitchenDemoDishSpec } from './types'

export const deanosKitchenDemoSpecs: KitchenDemoDishSpec[] = [
  ...deanosKitchenDemoCoreSpecs,
  ...deanosKitchenDemoPartySpecs,
  ...deanosKitchenDemoSeasonalSpecs,
]
