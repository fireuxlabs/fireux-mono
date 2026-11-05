import type { FireuxStamps } from './stamps.model'

/** Fields shared by App and Ecosystem. Readers supply id from the document path. */
export type FireuxEntity = {
  id: string
  /** Saved AI context; public projections omit this field. */
  context?: string
  created: FireuxStamps['created']
  updated: FireuxStamps['updated']
}
