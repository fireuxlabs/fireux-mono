// Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: remove browser Firestore search types.
import type { BasePlace } from '../../../../../../models/place.model'

export type BasePlaceRecord = BasePlace & { collection?: string }

export type SearchStage = {
  results: BasePlaceRecord[]
  stage: string
  debug?: Record<string, unknown>
}

export type MapToBasePlace = (p: any, collectionOverride?: string) => BasePlaceRecord
