import { uploadFileExtension } from '../uploads/multipart.ts'

export type DocumentKind = 'photo' | 'pdf' | 'document'

export function documentKindFromFile(input: {
  fileName: string
  contentType: string
  storedKind?: unknown
}): DocumentKind {
  if (
    input.storedKind === 'photo' ||
    input.storedKind === 'pdf' ||
    input.storedKind === 'document'
  ) {
    return input.storedKind
  }

  const extension = uploadFileExtension(input.fileName)
  const contentType = input.contentType.toLowerCase()

  if (
    contentType.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)
  ) {
    return 'photo'
  }

  if (contentType === 'application/pdf' || extension === '.pdf') {
    return 'pdf'
  }

  return 'document'
}
