import { deanosKitchenDemoCoreSpecs } from './specs/core'
import { deanosKitchenDemoPartySpecs } from './specs/party'
import { deanosKitchenDemoSeasonalSpecs } from './specs/seasonal'
import type { KitchenDemoItemSpec } from './types'

export const deanosKitchenDemoSpecs: KitchenDemoItemSpec[] = [
  ...deanosKitchenDemoCoreSpecs,
  ...deanosKitchenDemoPartySpecs,
  ...deanosKitchenDemoSeasonalSpecs,
]
