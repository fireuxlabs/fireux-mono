import {
  menuSourceFileEntries,
  type MenuSourceFileEntry,
} from '../../utils/records/file-identity'
import { readString } from 'fireux-core/runtime/server/utils/records/read'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export type KitchenMenuSourceRow = MenuSourceFileEntry

const urlRow = (source: Record<string, unknown>): KitchenMenuSourceRow[] => {
  const sourceUrl = readString(source.source_url)
  if (!sourceUrl) return []

  return [
    {
      id: readString(source.id) || 'url',
      file_name: sourceUrl,
      file_type: 'text/html',
      file_kind: 'url',
      storage_path: '',
      file_url: sourceUrl,
      sort_order: 0,
    },
  ]
}

export const sourceRows = (source: Record<string, unknown>) => {
  const files = menuSourceFileEntries(source)
  return files.length ? files : urlRow(asRecord(source))
}
