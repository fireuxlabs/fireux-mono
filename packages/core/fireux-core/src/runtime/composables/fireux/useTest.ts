import { computed, watchEffect, type ComputedRef } from 'vue'
import { useState } from '#imports'
import { defineWorkspaceCapabilityContext } from './workspace/workspaceCapabilityContext'

export type TestPacket = { id: string; value: string }
export type TestStatus = 'idle' | 'loading' | 'error' | 'empty' | 'ready'

type TestSource = {
  capabilityId: `${string}.test`
  entityId: string
  records: ComputedRef<TestPacket[]>
  status: ComputedRef<TestStatus>
  limit: ComputedRef<number | null>
  canWrite: ComputedRef<boolean>
  primitives: {
    create(value: string): Promise<TestPacket>
    update(id: string, value: string): Promise<void>
    delete(id: string): Promise<void>
  }
}

export function useTest(source: TestSource) {
  const selectedId = useState<string>(
    `fireux-${source.capabilityId}-${source.entityId}-selected-id`,
    () => ''
  )
  const awaitingId = useState<string>(
    `fireux-${source.capabilityId}-${source.entityId}-awaiting-id`,
    () => ''
  )
  const selected = computed(
    () =>
      source.records.value.find((record) => record.id === selectedId.value) ??
      null
  )
  const canCreate = computed(
    () =>
      source.canWrite.value &&
      (source.limit.value === null ||
        source.records.value.length < source.limit.value)
  )

  watchEffect(() => {
    if (source.status.value !== 'ready' && source.status.value !== 'empty')
      return
    if (selected.value) {
      awaitingId.value = ''
      return
    }
    if (selectedId.value && selectedId.value === awaitingId.value) return
    selectedId.value = source.records.value[0]?.id ?? ''
  })

  async function create(value: string) {
    const next = value.trim()
    if (!next || !canCreate.value) return false
    const created = await source.primitives.create(next)
    awaitingId.value = created.id
    selectedId.value = created.id
    return true
  }
  async function update(value: string) {
    const next = value.trim()
    if (!next || !selected.value || !source.canWrite.value) return false
    await source.primitives.update(selected.value.id, next)
    return true
  }
  async function remove() {
    if (!selected.value || !source.canWrite.value) return false
    await source.primitives.delete(selected.value.id)
    return true
  }
  function select(id: string) {
    selectedId.value = source.records.value.some((record) => record.id === id)
      ? id
      : ''
  }

  const state = computed(() => ({
    tests: source.records.value,
    selectedTestId: selectedId.value,
  }))
  const derived = computed(() => ({
    status: source.status.value,
    capability: defineWorkspaceCapabilityContext({
      id: source.capabilityId,
      subject: 'Test',
      primitives: {
        create: { available: canCreate.value, limit: source.limit.value },
        read: {
          available: source.records.value.length > 0,
          count: source.records.value.length,
        },
        update: { available: source.canWrite.value && Boolean(selected.value) },
        delete: { available: source.canWrite.value && Boolean(selected.value) },
      },
      natives: [{ id: 'select', primitive: 'read' }],
    }),
  }))

  return {
    records: source.records,
    selected,
    state,
    derived,
    primitives: { create, update, delete: remove },
    natives: { select },
  }
}
