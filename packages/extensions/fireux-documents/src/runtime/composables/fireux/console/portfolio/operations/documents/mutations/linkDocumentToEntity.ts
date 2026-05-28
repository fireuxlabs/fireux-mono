import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from 'fireux-properties/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio'
import { useTaskCreate } from 'fireux-tasks/runtime/composables/fireux/console/portfolio/operations/tasks/mutations/useTaskCreate'
import { useTaskProjection } from 'fireux-tasks/runtime/composables/fireux/console/portfolio/operations/tasks/utils/projection/useTaskProjection'
import { DocumentLinkStorage, type DocumentLink, type DocumentLinkTargetType } from '../../../../../../../models/document-link.model'
import { validateDocumentLinkTarget } from '../utils/validation/validateDocumentLinkTarget'

export type LinkDocumentToEntityInput = {
  documentId: string
  targetType: DocumentLinkTargetType
  targetId: string
  targetLabel?: string
  createTask?: boolean
}

const normalize = (value: unknown) => String(value || '').trim()

export function linkDocumentToEntity(runtimePortfolio = useActivePortfolio()) {
  const { createDocument } = useFirestoreCreate()
  const { createTask } = useTaskCreate(runtimePortfolio)
  const { fromDocumentLink } = useTaskProjection(runtimePortfolio)
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  async function mutate(input: LinkDocumentToEntityInput): Promise<string> {
    const portfolioId = normalize(runtimePortfolio.id.value)
    if (!portfolioId) {
      throw new Error('[fireux-documents] portfolio id is required for linking.')
    }

    if (runtimePortfolio.isDemo.value) {
      throw new Error('[fireux-documents] demo runtime does not allow writes.')
    }

    const documentId = normalize(input.documentId)
    if (!documentId) {
      throw new Error('[fireux-documents] documentId is required.')
    }

    const validation = validateDocumentLinkTarget(input.targetType, input.targetId)
    if (!validation.ok || !validation.targetType) {
      throw new Error(
        `[fireux-documents] link validation failed: ${validation.errors.join(' ')}`
      )
    }

    const payload: Omit<DocumentLink, 'id'> = {
      portfolio_id: portfolioId,
      document_id: documentId,
      target_type: validation.targetType,
      target_id: validation.targetId,
      target_label: normalize(input.targetLabel),
      created: { at: {} as any, by: undefined, app_id: undefined },
      updated: { at: {} as any, by: undefined },
    }

    if (!collectionPath.value) {
      throw new Error('[fireux-documents] runtime document link path is required.')
    }

    const linkId = await createDocument<Omit<DocumentLink, 'id'>>(collectionPath.value, payload, {
      stamp: true,
      creator: true,
      app: true,
    })

    if (input.createTask) {
      await createTask(
        fromDocumentLink({
          ...payload,
          id: linkId,
        })
      )
    }

    return linkId
  }

  return {
    linkDocumentToEntity: mutate,
  }
}
