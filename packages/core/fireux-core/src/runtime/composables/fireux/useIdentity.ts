import { computed, type Ref } from 'vue'

/** Shared identity read state; fields belong to the domain. */
export function useIdentity<Fields>(options: {
  id: Ref<string>
  fields: Ref<Fields>
  status: Ref<string>
}) {
  const readState = computed<'loading' | 'empty' | 'missing' | 'error' | null>(
    () => {
      const status = options.status.value
      if (status === 'ready') return null
      if (status === 'pending') return 'loading'
      if (status === 'error') return 'error'
      if (status === 'missing') return 'missing'
      return 'empty'
    }
  )
  const scopeKey = computed(() =>
    JSON.stringify([options.id.value, options.fields.value])
  )
  return {
    status: options.status,
    readState,
    scopeKey,
  }
}
