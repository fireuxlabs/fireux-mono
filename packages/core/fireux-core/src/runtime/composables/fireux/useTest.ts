import { computed, ref, watch, type Ref } from 'vue'
import { useWorkspacePageState } from './workspace/useWorkspacePageState'

type TestRecord = { id: string; value: string }
export function useTest(source: {
  id: Ref<string>
  family: string
  records: Ref<TestRecord[] | undefined>
  pending: Ref<boolean>
  error: Ref<unknown>
  captureIntent: () => () => boolean
  write: (method: 'POST' | 'PATCH' | 'DELETE', id?: string, value?: string) => Promise<{ test?: { id: string } }>
}) {
  const selectedId = ref('')
  const records = computed(() => source.records.value ?? [])
  const selected = computed(() => records.value.find(row => row.id === selectedId.value) ?? records.value[0] ?? null)
  watch(source.id, () => { selectedId.value = '' })
  const page = useWorkspacePageState(source.family)
  watch([source.id, records, selected, source.pending, source.error], () => page.publish({
    workspace: { id: source.id.value },
    collection: { records: records.value.map(({ id, value }) => ({ id, value })) },
    selected: selected.value ? { id: selected.value.id, value: selected.value.value } : null,
    derived: { pending: source.pending.value, readError: Boolean(source.error.value) },
  }), { immediate: true })
  return {
    captureIntent: source.captureIntent,
    id: source.id, records, selected, pending: source.pending,
    error: source.error,
    select: (id: string) => { selectedId.value = id },
    create: async (value: string) => {
      const isCurrent = source.captureIntent()
      const result = await source.write('POST', '', value)
      if (isCurrent() && result.test) selectedId.value = result.test.id
    },
    update: async (id: string, value: string) => { await source.write('PATCH', id, value) },
    remove: async (id: string) => { await source.write('DELETE', id) },
  }
}
export type TestController = ReturnType<typeof useTest>
