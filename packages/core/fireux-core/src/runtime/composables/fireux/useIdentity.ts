import { computed, type Ref } from 'vue'
import type { ReadOutcome } from '../../utils/read-outcome'

/** Shared identity read state; fields belong to the domain. */
export function useIdentity<Fields>(options: {
  id: Ref<string>
  fields: Ref<Fields>
  status: Ref<ReadOutcome>
}) {
  const scopeKey = computed(() =>
    JSON.stringify([options.id.value, options.fields.value])
  )
  return {
    status: options.status,
    scopeKey,
  }
}
