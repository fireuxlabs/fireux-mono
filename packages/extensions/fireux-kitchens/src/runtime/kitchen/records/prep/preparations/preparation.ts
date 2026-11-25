import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'

/** Kitchen-owned reusable output record, whether a component or a finished dish. */
export type Preparation = {
  id: string
  name: string
  description?: string
  image?: string
  created?: FireuxStamps['created']
  updated?: FireuxStamps['updated']
}
