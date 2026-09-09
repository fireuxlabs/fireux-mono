import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import type { Ref } from 'vue'

export function useKitchenTestRecords(id: Ref<string>) {
  const source = useKitchenChildCollection<{ id: string; value: string }>(
    'tests',
    id
  )
  const records = source.items
  const pending = source.pending
  const error = source.error
  return { records, pending, error }
}
