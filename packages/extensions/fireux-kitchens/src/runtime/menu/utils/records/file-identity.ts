const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export type MenuSourceFileEntry = {
  id: string
  file_name: string
  file_type: string
  file_kind: string
  storage_path: string
  file_url: string
  sort_order: number
}

/** Same file IDs and ordering as the source reader, including its legacy primary file. */
export function menuSourceFileEntries(value: unknown): MenuSourceFileEntry[] {
  const source = record(value)
  const files = Array.isArray(source.files) ? source.files : []
  const rows = files.length
    ? files
    : text(source.storage_path)
      ? [{ ...source, id: '1', sort_order: 0 }]
      : []
  return rows.map((value, index) => {
    const file = record(value)
    const order = Number(file.sort_order)
    return {
      id: text(file.id) || String(index + 1),
      file_name: text(file.file_name),
      file_type: text(file.file_type),
      file_kind: text(file.file_kind) || 'document',
      storage_path: text(file.storage_path),
      file_url: text(file.file_url),
      sort_order: Number.isFinite(order) ? order : 0,
    }
  })
}

/** Hash this serialization locally; never send its private field values as a revision. */
export function menuDocumentFileIdentity(value: unknown): string {
  const menu = record(value)
  const doc = record(menu.doc)
  return JSON.stringify([
    text(doc.url),
    text(doc.name),
    text(doc.type),
    text(doc.storage_path),
    text(menu.status),
    text(menu.slug),
    text(menu.format),
    text(menu.schedule),
  ])
}

export function menuSourceFileIdentity(value: unknown, fileId: string): string {
  const source = record(value)
  const files = menuSourceFileEntries(source).filter(
    (file) => file.id === fileId
  )
  return JSON.stringify([text(source.input_fingerprint), files])
}
