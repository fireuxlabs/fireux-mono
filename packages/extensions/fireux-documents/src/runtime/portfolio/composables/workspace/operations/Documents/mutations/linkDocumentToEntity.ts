import { useActivePortfolio } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import type { DocumentLinkTargetType } from '../../../../../models/document-link.model'
import { useDocumentMutation } from '../../../../useDocumentMutation'

export type LinkDocumentToEntityInput = {
  requestId: string
  documentId: string
  targetType: DocumentLinkTargetType
  targetId: string
  targetLabel?: string
  createTask?: boolean
}
export function linkDocumentToEntity(portfolio = useActivePortfolio()) {
  const mutate = useDocumentMutation(portfolio)
  return { linkDocumentToEntity: (input: LinkDocumentToEntityInput) => mutate('links', input) }
}
