import type {
  FireuxCreatedStamp,
  FireuxUpdatedStamp,
} from 'fireux-core/runtime/models/utils/stamps.model'

/** A reusable output the Kitchen makes, whether a component or a finished dish. */
export type Preparation = {
  id: string
  name: string
  description?: string
  image?: string
  created?: FireuxCreatedStamp
  updated?: FireuxUpdatedStamp
}
