import type { Ref } from 'vue'
import { unref } from 'vue'
import { usePlacesSearch } from './fetch/search/usePlacesSearch'
import { usePlacesCollection } from './fetch/usePlacesCollection'
import { usePlaceSave } from './mutations/usePlaceSave'

export interface UsePlacesOptions {
  keyword?: string | null | undefined | Ref<string | null | undefined>
  type?: string | null | undefined | Ref<string | null | undefined>
  types?: string[]
}

export function usePlaces<T extends Record<string, any> = Record<string, any>>(
  options: UsePlacesOptions = {}
) {
  return {
    ...usePlacesCollection(),
    ...usePlacesSearch(),
    ...usePlaceSave({ type: unref(options.type), types: options.types }),
  }
}
