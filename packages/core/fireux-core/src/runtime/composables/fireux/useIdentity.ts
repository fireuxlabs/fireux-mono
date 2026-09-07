import { computed, type Ref } from 'vue'

/** Common read/edit state; fields and mutations belong to the domain. */
export function useIdentity<Fields>(options: {
  id: Ref<string>
  fields: Ref<Fields>
  status: Ref<string>
  canWrite: Ref<boolean>
}) {
  const canWrite = computed(() => options.status.value === 'ready' && options.canWrite.value)
  const availableActions = computed(() =>
    options.status.value !== 'ready' ? [] : canWrite.value ? ['read', 'update'] : ['read']
  )
  const scopeKey = computed(() => JSON.stringify([options.id.value, options.fields.value]))
  return { status: options.status, canWrite, availableActions, scopeKey }
}
