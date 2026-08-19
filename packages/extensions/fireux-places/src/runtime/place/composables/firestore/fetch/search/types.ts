import type { BasePlace } from '../../../../models/place.model.ts'

export type BasePlaceRecord = BasePlace & { collection?: string }

export type SearchStage = {
  results: BasePlaceRecord[]
  stage: string
  debug?: Record<string, unknown>
}

export type MapToBasePlace = (p: any, collectionOverride?: string) => BasePlaceRecord
