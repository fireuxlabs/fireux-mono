import { fileRows, record } from './kitchen-menu-process'

const text = (value: unknown) => String(value ?? '').trim()

export type KitchenMenuSourceRow = ReturnType<typeof fileRows>[number]

const urlRow = (source: Record<string, unknown>): KitchenMenuSourceRow[] => {
  const sourceUrl = text(source.source_url)
  if (!sourceUrl) return []

  return [
    {
      id: text(source.id) || 'url',
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
  const files = fileRows(source)
  return files.length ? files : urlRow(record(source))
}
