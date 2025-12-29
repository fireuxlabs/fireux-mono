import { usePlaceCollection } from './fetch/usePlaceCollection'
import { usePlacesSearch } from './fetch/search/usePlacesSearch'
import { usePlaceCreate } from './mutations/usePlaceCreate'
import { usePlaceSave } from './mutations/usePlaceSave'
import type { Ref } from 'vue'
import { unref } from 'vue'

export interface UsePlacesOptions {
  keyword?: string | null | undefined | Ref<string | null | undefined>
  type?: string | null | undefined | Ref<string | null | undefined>
  types?: string[]
}

export function usePlaces<T extends Record<string, any> = Record<string, any>>(
  options: UsePlacesOptions = {}
) {
  const type = unref(options.type)

  return {
    ...usePlaceCollection<T>(options),
    ...usePlacesSearch(),
    ...usePlaceCreate({ types: options.types }),
    ...usePlaceSave({ type, types: options.types }),
  }
}
