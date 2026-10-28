import { computed, type Ref } from 'vue'
import {
  humanizeDebugKey,
  isDebugColor,
} from '../../utils/diagnostics/format'

type DebugEntry = {
  key: string
  label: string
  kind: 'empty' | 'value' | 'structured'
  text: string
  json?: string
  color?: string
  value: unknown
}

const entryFor = (key: string, value: unknown): DebugEntry => {
  if (value === null || value === undefined || value === '') {
    return {
      key,
      label: humanizeDebugKey(key),
      kind: 'empty',
      text:
        value === null ? 'null' : value === undefined ? 'undefined' : 'empty',
      value,
    }
  }

  if (Array.isArray(value) || typeof value === 'object') {
    const size = Array.isArray(value)
      ? value.length
      : Object.keys(value as object).length
    return {
      key,
      label: humanizeDebugKey(key),
      kind: 'structured',
      text: `${Array.isArray(value) ? 'Array' : 'Object'} · ${size} ${size === 1 ? 'item' : 'items'}`,
      json: JSON.stringify(value, null, 2),
      value,
    }
  }

  const text = String(value)
  return {
    key,
    label: humanizeDebugKey(key),
    kind: 'value',
    text,
    color: isDebugColor(value) ? value : undefined,
    value,
  }
}

export function useDiagnosticsDebugSections(data: Ref<unknown>) {
  return computed(() => {
    const value = data.value

    if (value && !Array.isArray(value) && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).map(
        ([key, section]) => {
          const isRecord =
            section && !Array.isArray(section) && typeof section === 'object'
          const entries = isRecord
            ? Object.entries(section as Record<string, unknown>).map(
                ([entryKey, entry]) => entryFor(entryKey, entry)
              )
            : Array.isArray(section)
              ? section.map((entry, index) =>
                  entryFor(String(index + 1), entry)
                )
              : [entryFor(key, section)]

          return {
            key,
            label: humanizeDebugKey(key),
            meta: isRecord
              ? `${entries.length} fields`
              : Array.isArray(section)
                ? `${entries.length} items`
                : 'Value',
            entries,
          }
        }
      )
    }

    const entries = Array.isArray(value)
      ? value.map((entry, index) => entryFor(String(index + 1), entry))
      : [entryFor('value', value)]

    return [
      {
        key: 'data',
        label: Array.isArray(value) ? 'Items' : 'Value',
        meta: `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`,
        entries,
      },
    ]
  })
}
