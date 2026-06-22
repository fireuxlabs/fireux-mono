import { readString } from 'fireux-core/runtime/server/utils/records/read.ts'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export type KitchenMenuSourceRow = {
  id: string
  file_name: string
  file_type: string
  file_kind: string
  storage_path: string
  file_url: string
  sort_order: number
}

const uploadedFileRows = (
  source: Record<string, unknown>
): KitchenMenuSourceRow[] => {
  const files = Array.isArray(source.files) ? source.files.map(asRecord) : []

  if (files.length) {
    return files.map((file, index) => ({
      id: readString(file.id) || String(index + 1),
      file_name: readString(file.file_name),
      file_type: readString(file.file_type),
      file_kind: readString(file.file_kind) || 'document',
      storage_path: readString(file.storage_path),
      file_url: readString(file.file_url),
      sort_order: numberValue(file.sort_order),
    }))
  }

  return readString(source.storage_path)
    ? [
        {
          id: '1',
          file_name: readString(source.file_name),
          file_type: readString(source.file_type),
          file_kind: readString(source.file_kind) || 'document',
          storage_path: readString(source.storage_path),
          file_url: readString(source.file_url),
          sort_order: 0,
        },
      ]
    : []
}

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
  const files = uploadedFileRows(source)
  return files.length ? files : urlRow(asRecord(source))
}
