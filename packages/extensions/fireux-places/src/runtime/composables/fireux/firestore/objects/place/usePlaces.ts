import { usePlaceCollection } from './fetch/usePlaceCollection'
import { usePlacesSearch } from './fetch/search/usePlacesSearch'
import { usePlaceCreate } from './mutations/usePlaceCreate'
import { usePlaceSave } from './mutations/usePlaceSave'
import type { Ref } from 'vue'

export interface UsePlacesOptions {
  keyword?: string | null | undefined | Ref<string | null | undefined>
  type?: string | null | undefined | Ref<string | null | undefined>
  types?: string[]
}

export function usePlaces<T extends Record<string, any> = Record<string, any>>(
  options: UsePlacesOptions = {}
) {
  return {
    ...usePlaceCollection<T>(options),
    ...usePlacesSearch(),
    ...usePlaceCreate({ types: options.types }),
    ...usePlaceSave(),
  }
}
