import type { Ref } from 'vue'
import { useJobRead } from './useJobRead'

export function useJobFetch(id: string | Ref<string | null | undefined>) {
  return useJobRead(id)
}
