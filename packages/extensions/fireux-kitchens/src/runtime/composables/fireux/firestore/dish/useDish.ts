import { useDishCollection } from './fetch/useDishCollection'
import { useDishFetch } from './fetch/useDishFetch'
import { useDishCreate } from './mutations/useDishCreate'
import { useDishUpdate } from './mutations/useDishUpdate'
import { useDishDelete } from './mutations/useDishDelete'
import { useDishInterface } from './utils/view/useDishInterface'
import { resolveDishSemanticLine } from './utils/view/resolveDishSemanticLine'

export {
  useDishCollection,
  useDishFetch,
  useDishCreate,
  useDishUpdate,
  useDishDelete,
  useDishInterface,
  resolveDishSemanticLine,
}

export function useDish() {
  return {
    ...useDishCreate(),
    ...useDishUpdate(),
    ...useDishDelete(),
    ...useDishInterface(),
  }
}
