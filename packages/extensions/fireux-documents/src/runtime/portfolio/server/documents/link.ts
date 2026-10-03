import { createHash } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readPortfolioMutationActor, requirePortfolioMutationAuthority } from 'fireux-properties/runtime/portfolio/server/team/authority'
import { stagePortfolioTaskCreate } from 'fireux-tasks/runtime/portfolio/server/tasks/commands'
import { validateDocumentLinkTarget } from '../../utils/documents/validateDocumentLinkTarget'
import { documentFields, documentString, invalidDocumentInput } from './input'

export async function linkPortfolioDocument(event: H3Event, input: unknown) {
  const value = documentFields(input, ['portfolioId', 'requestId', 'documentId', 'targetType', 'targetId', 'targetLabel', 'createTask'])
  const portfolioId = requireFirestoreDocumentId(value.portfolioId, 'Portfolio id'), id = requireFirestoreDocumentId(value.requestId, 'Link request id')
  const documentId = requireFirestoreDocumentId(value.documentId, 'Document id')
  const targetType = documentString(value.targetType, true), targetId = documentString(value.targetId, true), targetLabel = documentString(value.targetLabel ?? '')
  if (!validateDocumentLinkTarget(targetType, targetId).ok || (value.createTask !== undefined && typeof value.createTask !== 'boolean')) invalidDocumentInput()
  const createTask = value.createTask === true, actor = await readPortfolioMutationActor(event)
  const fingerprint = createHash('sha256').update(JSON.stringify([portfolioId, actor.uid, actor.runtimeAppId, documentId, targetType, targetId, targetLabel, createTask])).digest('hex')
  const target = (collection: string) => defineFirestoreMutationTarget({ key: `portfolio.${collection}`, lane: 'server', verbs: ['create'], database: { kind: 'runtime' }, collectionPath: `portfolios/${portfolioId}/${collection}` })
  await runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requirePortfolioMutationAuthority(tx, actor, portfolioId)
    const [document, link] = await Promise.all([tx.read(target('documents'), documentId), tx.read(target('document-links'), id)])
    if (!document.exists || document.data?.portfolio_id !== portfolioId) throw createError({ statusCode: 404, statusMessage: 'Document was not found in this Portfolio.' })
    if (link.exists) {
      if (link.data?.link_request !== fingerprint) throw createError({ statusCode: 409, statusMessage: 'Link request was already used for different content.' })
      return
    }
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    // Target remains the existing typed reference, not proof that the referenced entity exists.
    tx.create(target('document-links'), id, { portfolio_id: portfolioId, document_id: documentId, target_type: targetType, target_id: targetId, target_label: targetLabel, link_request: fingerprint, created: stamp, updated: stamp })
    if (createTask) stagePortfolioTaskCreate(tx, actor, portfolioId, `document-${id}`, {
      title: `Review linked document ${documentId}`, description: `Target type ${targetType} · Target id ${targetId} · Portfolio ${portfolioId}`, status: 'open', source: 'documents', due_date: new Date().toISOString().slice(0, 10), linked_entity_type: targetType, linked_entity_id: id,
    })
  })
  return { id, portfolioId }
}
