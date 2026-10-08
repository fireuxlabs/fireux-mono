import { computed, type Ref } from 'vue'

/** Common read/edit state; fields and mutations belong to the domain. */
export function useIdentity<Fields>(options: {
  id: Ref<string>
  fields: Ref<Fields>
  status: Ref<string>
  canWrite: Ref<boolean>
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
  const canWrite = computed(
    () => options.status.value === 'ready' && options.canWrite.value
  )
  const availableActions = computed(() =>
    options.status.value !== 'ready'
      ? []
      : canWrite.value
        ? ['read', 'update']
        : ['read']
  )
  const scopeKey = computed(() =>
    JSON.stringify([options.id.value, options.fields.value])
  )
  return {
    status: options.status,
    readState,
    canWrite,
    availableActions,
    scopeKey,
  }
}
