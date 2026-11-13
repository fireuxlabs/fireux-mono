import type {
  FireuxCreatedStamp,
  FireuxUpdatedStamp,
} from 'fireux-core/runtime/models/utils/stamps.model'

/** Reusable Kitchen-owned identity. The reader supplies id from its path. */
export type Item = {
  id: string
  name: string
  description?: string
  /** One photographic image URL, delivered through the shared photo contract. */
  image?: string
  /** Older records may lack provenance; creation commands still write both stamps. */
  created?: FireuxCreatedStamp
  updated?: FireuxUpdatedStamp
}
