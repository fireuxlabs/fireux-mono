// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require Portfolio operator access for document linking.
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  requirePortfolioWorkspaceWrite,
  useActivePortfolio,
  usePortfolioWorkspaceChildPath,
} from 'fireux-properties/runtime/portfolio/composables/workspace/operations/useActivePortfolio'
import { useTaskCreate } from 'fireux-tasks/runtime/portfolio/composables/workspace/operations/Tasks/mutations/useTaskCreate'
import { useTaskProjection } from 'fireux-tasks/runtime/portfolio/composables/workspace/operations/Tasks/utils/projection/useTaskProjection'
import { DocumentLinkStorage, type DocumentLink, type DocumentLinkTargetType } from '../../../../../models/document-link.model'
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
  const create = useFirestoreClientCreate()
  const { createTask } = useTaskCreate(runtimePortfolio)
  const { fromDocumentLink } = useTaskProjection(runtimePortfolio)
  const collectionPath = usePortfolioWorkspaceChildPath(
    runtimePortfolio,
    DocumentLinkStorage.collection
  )

  async function mutate(input: LinkDocumentToEntityInput): Promise<string> {
    const portfolioId = requirePortfolioWorkspaceWrite(
      runtimePortfolio,
      'fireux-documents'
    )

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

    const linkId = await create(
      defineRuntimeClientCreateTarget(
        'project.portfolio.document-links',
        collectionPath.value
      ),
      payload,
      { stamp: true, creator: true, app: true }
    )

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
