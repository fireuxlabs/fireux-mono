import { computed, isRef, unref, type ComputedRef, type Ref } from 'vue'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

type DevDebugDataOptions = {
  stringifyErrorMessage?: string
  treatEmptyContainersAsEmpty?: boolean
}

const normalizeForJson = (
  value: unknown,
  seen = new WeakSet<object>()
): unknown => {
  const source = isRef(value) ? unref(value) : value

  if (source === null || source === undefined) return source
  if (typeof source === 'function') return undefined
  if (typeof source === 'bigint') return source.toString()
  if (
    typeof source === 'string' ||
    typeof source === 'number' ||
    typeof source === 'boolean'
  ) {
    return source
  }

  if (source instanceof Date) return source.toISOString()
  if (source instanceof Error) {
    return {
      name: source.name,
      message: source.message,
      stack: source.stack,
    }
  }

  if (Array.isArray(source)) {
    return source.map((entry) => normalizeForJson(entry, seen))
  }

  if (typeof source === 'object') {
    const objectSource = source as Record<string, unknown>
    if (seen.has(objectSource)) return '[Circular]'

    seen.add(objectSource)

    if (source instanceof Map) {
      return Array.from(source.entries()).map(([key, entry]) => ({
        key: normalizeForJson(key, seen),
        value: normalizeForJson(entry, seen),
      }))
    }

    if (source instanceof Set) {
      return Array.from(source.values()).map((entry) =>
        normalizeForJson(entry, seen)
      )
    }

    const normalized: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(objectSource)) {
      const nextValue = normalizeForJson(entry, seen)
      if (nextValue !== undefined) normalized[key] = nextValue
    }
    return normalized
  }

  return String(source)
}

const summarizeValue = (value: unknown): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === 'object') {
    return `Object(${Object.keys(value as Record<string, unknown>).length})`
  }
  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) return '""'
    const clipped =
      normalized.length > 72 ? `${normalized.slice(0, 72)}...` : normalized
    return `"${clipped}"`
  }
  return String(value)
}

export function useDevDebugData(
  data: MaybeRef<unknown>,
  options: DevDebugDataOptions = {}
) {
  const normalizedData = computed(() => normalizeForJson(unref(data)))
  const treatsEmptyContainersAsEmpty = computed(
    () => options.treatEmptyContainersAsEmpty !== false
  )

  const isEmpty = computed(() => {
    const value = normalizedData.value
    if (value === null || value === undefined) return true
    if (!treatsEmptyContainersAsEmpty.value) return false
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    if (typeof value === 'string') return value.length === 0
    return false
  })

  const dataKind = computed<'array' | 'object' | 'primitive' | 'empty'>(() => {
    const value = normalizedData.value
    if (isEmpty.value) return 'empty'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object' && value !== null) return 'object'
    return 'primitive'
  })

  const dataKindLabel = computed(() => {
    if (dataKind.value === 'array') return 'Collection'
    if (dataKind.value === 'object') return 'Object'
    if (dataKind.value === 'primitive') return 'Primitive'
    return 'Empty'
  })

  const dataSizeLabel = computed(() => {
    const value = normalizedData.value
    if (Array.isArray(value)) return `${value.length} items`
    if (value && typeof value === 'object') {
      return `${Object.keys(value as Record<string, unknown>).length} keys`
    }
    if (dataKind.value === 'primitive') return '1 value'
    return '0'
  })

  const objectPreviewEntries = computed(() => {
    if (dataKind.value !== 'object') {
      return [] as Array<{ key: string; value: string }>
    }

    const source = normalizedData.value as Record<string, unknown>
    return Object.keys(source)
      .slice(0, 18)
      .map((key) => ({
        key,
        value: summarizeValue(source[key]),
      }))
  })

  const showObjectPreview = computed(
    () => dataKind.value === 'object' && objectPreviewEntries.value.length > 0
  )

  const jsonString = computed(() => {
    try {
      return JSON.stringify(normalizedData.value, null, 2) ?? 'undefined'
    } catch {
      return options.stringifyErrorMessage ?? '[Debug] Unable to stringify data'
    }
  })

  return {
    normalizedData,
    isEmpty,
    dataKind,
    dataKindLabel,
    dataSizeLabel,
    objectPreviewEntries,
    showObjectPreview,
    jsonString,
  }
}
