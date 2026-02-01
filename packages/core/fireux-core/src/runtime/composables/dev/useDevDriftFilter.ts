import { computed, ref, watch, type ComputedRef } from 'vue'
import {
    humanizeDriftPath,
    resolveDriftFromModel,
    type DriftKind,
    type ModelDrift,
} from './useModelDrift'

type WithOptionalId = { id?: string | null | undefined }

type DevDriftFieldOption = {
  key: string
  count: number
  label: string
}

type DevDriftFilterOption = {
  label: string
  value: string
}

export function useDevDriftFilter<T extends WithOptionalId>(params: {
  collection: ComputedRef<T[]>
  runtimeModel: Record<string, unknown>
  prepareForDrift?: (doc: T) => Record<string, unknown>
  driftMode?: 'all' | 'extras-only'
}) {
  const driftKind = ref<DriftKind>(params.driftMode === 'extras-only' ? 'extra' : 'missing')
  const selectedField = ref<string>('')

  const setDriftKind = (kind: DriftKind) => {
    driftKind.value = params.driftMode === 'extras-only' ? 'extra' : kind
  }

  watch(driftKind, () => {
    selectedField.value = ''
  })

  const driftById = computed(() => {
    const map = new Map<string, ModelDrift>()
    for (const doc of params.collection.value) {
      const id = doc?.id
      if (!id) {
        map.set(`missing-id-${map.size + 1}`, {
          missing: ['id'],
          extra: [],
        })
        continue
      }
      const payload = params.prepareForDrift
        ? params.prepareForDrift(doc)
        : (doc as unknown as Record<string, unknown>)
      const drift = resolveDriftFromModel(params.runtimeModel, payload)
      map.set(id, params.driftMode === 'extras-only' ? { ...drift, missing: [] } : drift)
    }
    return map
  })

  const fieldOptions = computed<DevDriftFieldOption[]>(() => {
    const counts = new Map<string, number>()
    for (const drift of driftById.value.values()) {
      const list = driftKind.value === 'missing' ? drift.missing : drift.extra
      for (const field of list) counts.set(field, (counts.get(field) ?? 0) + 1)
    }

    return [...counts.entries()]
      .map(([key, count]) => ({
        key,
        count,
        label: `${humanizeDriftPath(key)} (${count})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  })

  const filterOptions = computed<DevDriftFilterOption[]>(() => [
    { label: 'All', value: '' },
    ...fieldOptions.value.map((o) => ({ label: o.label, value: o.key })),
  ])

  const filteredCollection = computed<T[]>(() => {
    if (!selectedField.value) return params.collection.value

    return params.collection.value.filter((doc) => {
      const id = doc?.id
      if (!id) return false
      const drift = driftById.value.get(id)
      if (!drift) return false
      const list = driftKind.value === 'missing' ? drift.missing : drift.extra
      return list.includes(selectedField.value)
    })
  })

  return {
    driftKind,
    setDriftKind,
    selectedField,
    driftById,
    fieldOptions,
    filterOptions,
    filteredCollection,
  }
}
