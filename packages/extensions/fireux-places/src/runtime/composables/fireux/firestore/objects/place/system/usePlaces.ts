import { usePlaceCollection } from '../fetch/usePlaceCollection'
import { usePlaceCreate } from '../mutations/usePlaceCreate'
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
    ...usePlaceCreate({ types: options.types }),
  }
}
