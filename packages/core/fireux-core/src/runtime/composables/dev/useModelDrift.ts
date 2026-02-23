export type DriftKind = 'missing' | 'extra'

export type ModelDrift = {
  missing: string[]
  extra: string[]
}

export const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (!v || typeof v !== 'object') return false
  if (Array.isArray(v)) return false
  return Object.prototype.toString.call(v) === '[object Object]'
}

export const kindOf = (v: unknown): string => {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

const parseEnum = (value: unknown): string[] | null => {
  if (typeof value !== 'string') return null
  if (!value.startsWith('enum:')) return null
  const list = value
    .slice('enum:'.length)
    .split('|')
    .map((v) => v.trim())
    .filter(Boolean)
  return list.length ? list : null
}

export const isMissingValue = (modelValue: unknown, dataValue: unknown): boolean => {
  if (typeof modelValue === 'string') return typeof dataValue !== 'string'
  if (Array.isArray(modelValue)) return !Array.isArray(dataValue)
  if (typeof modelValue === 'number') return typeof dataValue !== 'number'
  if (isPlainObject(modelValue)) return !isPlainObject(dataValue)
  return false
}

export const resolveDriftFromModel = (
  model: Record<string, unknown>,
  data: Record<string, unknown> | undefined,
  basePath = '',
  options: {
    includeMissing?: boolean
    requiredPaths?: Set<string>
    ignoreExtraTimestampFields?: boolean
  } = {}
): ModelDrift => {
  const missing: string[] = []
  const extra: string[] = []
  const includeMissing = options.includeMissing !== false
  const requiredPaths = options.requiredPaths ?? new Set<string>()
  const ignoreExtraTimestampFields = options.ignoreExtraTimestampFields !== false

  const addTypeMismatch = (path: string, expected: string, actual: string) => {
    extra.push(`${path} (type-mismatch: expected ${expected}; got ${actual})`)
  }

  const dataObj = isPlainObject(data) ? data : {}

  for (const key of Object.keys(model)) {
    const modelValue = model[key]
    const dataValue = dataObj[key]
    const path = basePath ? `${basePath}.${key}` : key

    const enumValues = parseEnum(modelValue)
    if (enumValues) {
      if (typeof dataValue !== 'string' || !enumValues.includes(dataValue)) {
        const actual = typeof dataValue === 'string' ? dataValue : kindOf(dataValue)
        if (includeMissing) {
          missing.push(`${path} (enum:${enumValues.join('|')}; got ${actual})`)
        } else if (dataValue !== undefined) {
          addTypeMismatch(path, `enum:${enumValues.join('|')}`, actual)
        }
      }
      continue
    }

    if (isPlainObject(modelValue)) {
      // Treat empty objects in the model as leaf nodes.
      // This is especially useful for timestamp-like fields (e.g., {} as FirebaseTimestamp)
      // where we want to validate presence but ignore internal keys.
      if (Object.keys(modelValue).length === 0) {
        if (isMissingValue(modelValue, dataValue)) {
          if (includeMissing || requiredPaths.has(path)) {
            missing.push(`${path} (${kindOf(modelValue)})`)
          } else if (dataValue !== undefined) {
            addTypeMismatch(path, kindOf(modelValue), kindOf(dataValue))
          }
        }
        continue
      }

      if (dataValue !== undefined && !isPlainObject(dataValue)) {
        if (!includeMissing) {
          addTypeMismatch(path, kindOf(modelValue), kindOf(dataValue))
          continue
        }
      }

      const nested = resolveDriftFromModel(
        modelValue,
        isPlainObject(dataValue) ? (dataValue as Record<string, unknown>) : undefined,
        path,
        options
      )
      if (includeMissing || requiredPaths.has(path)) missing.push(...nested.missing)
      extra.push(...nested.extra)
      continue
    }

    if (isMissingValue(modelValue, dataValue)) {
      // Allow aliasing between legacy `created_by` and new `creator_id`.
      if (
        (key === 'created_by' && typeof dataObj['creator_id'] === 'string') ||
        (key === 'creator_id' && typeof dataObj['created_by'] === 'string')
      ) {
        continue
      }

      // If the model expects a timestamp-like empty object, tolerate common
      // canonical timestamp fields present on the data (created_at/updated_at)
      if (
        isPlainObject(modelValue) &&
        Object.keys(modelValue).length === 0 &&
        (dataObj['created_at'] !== undefined || dataObj['updated_at'] !== undefined)
      ) {
        continue
      }

      if (includeMissing || requiredPaths.has(path)) {
        missing.push(`${path} (${kindOf(modelValue)})`)
      } else if (dataValue !== undefined) {
        addTypeMismatch(path, kindOf(modelValue), kindOf(dataValue))
      }
    }
  }

  for (const key of Object.keys(dataObj)) {
    // Ignore known opt-in client-side timestamp fields and stamp metadata
    // These fields are added by stamping modes (time/pinpoint) and should not
    // be treated as drift when the canonical model doesn't include them.
    const IGNORE_EXTRA_TIMESTAMP = /^(created_at(?:_ms)?|updated_at(?:_ms)?|stamp_mode)$/
    if (ignoreExtraTimestampFields && IGNORE_EXTRA_TIMESTAMP.test(key)) continue

    if (key in model) continue
    const path = basePath ? `${basePath}.${key}` : key
    extra.push(`${path} (${kindOf(dataObj[key])})`)
  }

  return { missing, extra }
}

export const humanizeDriftPath = (path: string) =>
  path
    .split(' (')[0]
    .split('.')
    .map((p) => p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' · ')
