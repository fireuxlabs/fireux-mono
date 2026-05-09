import { useDishCollection } from './fetch/useDishCollection'
import { useDishFetch } from './fetch/useDishFetch'
import { useDishCreate } from './mutations/useDishCreate'
import { useDishUpdate } from './mutations/useDishUpdate'
import { useDishDelete } from './mutations/useDishDelete'
import { useDishInterface } from './utils/view/useDishInterface'

export {
  useDishCollection,
  useDishFetch,
  useDishCreate,
  useDishUpdate,
  useDishDelete,
  useDishInterface,
}

export function useDish() {
  return {
    ...useDishCreate(),
    ...useDishUpdate(),
    ...useDishDelete(),
    ...useDishInterface(),
  }
}
