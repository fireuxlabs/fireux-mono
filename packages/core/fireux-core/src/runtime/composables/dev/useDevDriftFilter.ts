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
  requiredPaths?: string[]
}) {
  const hasRequiredPaths = false
  const driftKind = ref<DriftKind>('extra')
  const selectedField = ref<string>('')

  const setDriftKind = () => {
    driftKind.value = 'extra'
  }

  const setSelectedField = (value: string) => {
    selectedField.value = value
  }

  watch(driftKind, () => {
    selectedField.value = ''
  })

  const normalizeId = (value: unknown, fallback: string) => {
    const raw = String(value ?? '').trim()
    return raw || fallback
  }

  const buildDriftForDoc = (doc: T, fallbackId: string) => {
    const id = normalizeId(doc?.id, fallbackId)
    if (!doc?.id) {
      return {
        id,
        drift: { missing: [], extra: [] },
      }
    }
    const payload = params.prepareForDrift
      ? params.prepareForDrift(doc)
      : (doc as unknown as Record<string, unknown>)
    const drift = resolveDriftFromModel(params.runtimeModel, payload, '', {
      includeMissing: false,
      requiredPaths: new Set(),
    })
    if (hasRequiredPaths) {
      return {
        id,
        drift: {
          missing: [],
          extra: [...drift.extra, ...drift.missing],
        },
      }
    }
    return {
      id,
      drift: { ...drift, missing: [] },
    }
  }

  const driftById = computed(() => {
    const map = new Map<string, ModelDrift>()
    for (const doc of params.collection.value) {
      const { id, drift } = buildDriftForDoc(doc, `missing-id-${map.size + 1}`)
      map.set(id, drift)
    }
    return map
  })

  const fieldOptions = computed<DevDriftFieldOption[]>(() => {
    const counts = new Map<string, number>()
    for (const drift of driftById.value.values()) {
      const list = drift.extra
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
      const list = drift.extra
      return list.includes(selectedField.value)
    })
  })

  const buildDriftPayload = <R>(options: {
    collection?: ComputedRef<T[]>
    map: (args: { doc: T; id: string; drift: ModelDrift; index: number }) => R
  }) => {
    const source = options.collection ?? filteredCollection
    return computed<R[]>(() =>
      source.value.map((doc, index) => {
        const { id, drift } = buildDriftForDoc(doc, `missing-id-${index + 1}`)
        return options.map({ doc, id, drift, index })
      })
    )
  }

  const buildCopyPayload = <R>(options: {
    modelPath: string
    itemsKey: string
    items: ComputedRef<R[]>
    total?: ComputedRef<number>
    selectedFieldOverride?: ComputedRef<string | null>
  }) => {
    const { modelPath, itemsKey, items } = options
    return computed<Record<string, unknown>>(() => {
      const total = options.total?.value ?? items.value.length
      const selected =
        options.selectedFieldOverride?.value ?? (selectedField.value || null)
      return {
        modelPath,
        driftKind: driftKind.value,
        selectedField: selected,
        total,
        [itemsKey]: items.value,
      }
    })
  }

  return {
    driftKind,
    setDriftKind,
    selectedField,
    setSelectedField,
    driftById,
    fieldOptions,
    filterOptions,
    filteredCollection,
    buildDriftPayload,
    buildCopyPayload,
  }
}
