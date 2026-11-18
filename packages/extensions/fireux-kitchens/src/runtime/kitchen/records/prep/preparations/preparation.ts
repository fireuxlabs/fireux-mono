import type {
  FireuxCreatedStamp,
  FireuxUpdatedStamp,
} from 'fireux-core/runtime/models/utils/stamps.model'

/** Kitchen-owned reusable output record, whether a component or a finished dish. */
export type Preparation = {
  id: string
  name: string
  description?: string
  image?: string
  created?: FireuxCreatedStamp
  updated?: FireuxUpdatedStamp
}
