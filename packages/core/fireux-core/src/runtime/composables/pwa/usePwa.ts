import { useNuxtApp } from '#imports'
import type { PwaController } from './controller'

/** Client-only consumers share the one controller mounted by Core's plugin. */
export function usePwa(): PwaController {
  return useNuxtApp().$fireuxPwa as PwaController
}
