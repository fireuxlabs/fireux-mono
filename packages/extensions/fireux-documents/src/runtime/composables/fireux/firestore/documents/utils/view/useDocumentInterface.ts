import type { Document } from '../../../../../../models/document.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace DocumentCard {
  export type Card = {
    id: string
    title: string
    subtitle: string
    meta: string
    to: string
  }
}

export function useDocumentInterface() {
  function card(target?: Document | null | undefined): DocumentCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    return {
      id,
      title: safeString(target.file_name) || id,
      subtitle: safeString(target.file_type) || 'Unknown file type',
      meta: `size ${target.size_bytes || 0} bytes · uploaded ${safeString(target.uploaded_at) || 'unset'}`,
      to: '/console/portfolio/documents',
    }
  }

  function searchText(target: Document): string {
    return [
      target.id,
      target.file_name,
      target.file_type,
      target.storage_path,
      target.uploaded_at,
    ]
      .map((value) => safeString(value))
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    card,
    searchText,
  }
}
