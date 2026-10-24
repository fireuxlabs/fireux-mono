import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import type { DocumentLinkTargetType } from '../../models/document-link.model'
import { useDocumentMutation } from '../../composables/useDocumentMutation'

export type LinkDocumentToEntityInput = {
  requestId: string
  documentId: string
  targetType: DocumentLinkTargetType
  targetId: string
  targetLabel?: string
  createTask?: boolean
}
export function linkDocumentToEntity(
  portfolio: ReturnType<typeof usePortfolioScope>
) {
  const mutate = useDocumentMutation(portfolio)
  return {
    linkDocumentToEntity: (input: LinkDocumentToEntityInput) =>
      mutate('links', input),
  }
}
