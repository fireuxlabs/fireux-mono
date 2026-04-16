import type { Document } from '../../../../../../models/document.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace DocumentCard {
  export type Card = {
    id: string
    imageUrl: string
    title: string
    subtitle: string
    meta: string
    status: string
    badges: string[]
    summary: string
    to: string
  }
}

export function useDocumentInterface() {
  type DocumentPill = DocumentCard.Card
  type DocumentCell = DocumentCard.Card
  type DocumentPreview = DocumentCard.Card
  type DocumentProfile = DocumentCard.Card

  function buildInterface(
    target?: Document | null | undefined
  ): DocumentCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    return {
      id,
      imageUrl: '',
      title: safeString(target.file_name) || id,
      subtitle: safeString(target.file_type) || 'Unknown file type',
      meta: `size ${target.size_bytes || 0} bytes · uploaded ${safeString(target.uploaded_at) || 'unset'}`,
      status: '',
      badges: [],
      summary: '',
      to: '/console/portfolio/documents',
    }
  }

  const toInterface = buildInterface

  function pill(target?: Document | null | undefined): DocumentPill | null {
    return buildInterface(target)
  }

  function cell(target?: Document | null | undefined): DocumentCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: Document | null | undefined
  ): DocumentPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: Document | null | undefined
  ): DocumentProfile | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
