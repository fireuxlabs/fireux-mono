import { createHash } from 'node:crypto'
import { createError, type H3Event, type MultiPartData } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readPortfolioMutationActor, requirePortfolioMutationAuthority } from 'fireux-properties/runtime/portfolio/server/team/authority'
import { storePortfolioDocument } from './storage'
import { invalidDocumentInput, documentString } from './input'

export async function uploadPortfolioDocument(event: H3Event, parts: MultiPartData[] | undefined, verifiedActor?: Awaited<ReturnType<typeof readPortfolioMutationActor>>) {
  if (!parts || parts.length !== 4 || new Set(parts.map(part => part.name)).size !== 4 || parts.some(part => !['portfolioId', 'requestId', 'notes', 'file'].includes(part.name || ''))) invalidDocumentInput()
  const text = (name: string) => { const part = parts.find(part => part.name === name)!; if (part.filename) invalidDocumentInput(); return part.data.toString('utf8') }
  const portfolioId = requireFirestoreDocumentId(text('portfolioId'), 'Portfolio id')
  const requestId = requireFirestoreDocumentId(text('requestId'), 'Upload request id')
  const notes = documentString(text('notes'))
  const file = parts.find(part => part.name === 'file')!
  const fileName = documentString(file.filename, true), contentType = file.type || 'application/octet-stream'
  const actor = verifiedActor ?? await readPortfolioMutationActor(event)
  const fingerprint = createHash('sha256').update(JSON.stringify([portfolioId, requestId, actor.uid, actor.runtimeAppId, fileName, contentType, notes])).update(file.data).digest('hex')
  const target = defineFirestoreMutationTarget({ key: 'portfolio.documents', lane: 'server', verbs: ['create'], database: { kind: 'runtime' }, collectionPath: `portfolios/${portfolioId}/documents` })
  const existing = async (tx: Parameters<Parameters<typeof runGuardedServerTransaction>[1]>[0]) => {
    await requirePortfolioMutationAuthority(tx, actor, portfolioId)
    const record = await tx.read(target, requestId)
    if (record.exists && record.data?.upload_request !== fingerprint) throw createError({ statusCode: 409, statusMessage: 'Upload request was already used for different content.' })
    return record.exists
  }
  if (await runGuardedServerTransaction({ kind: 'runtime' }, existing)) return { id: requestId }
  const stored = await storePortfolioDocument({ portfolioId, requestId, fingerprint, data: file.data, contentType })
  // Storage and Firestore cannot commit atomically. Retain exactly this owned upload on
  // uncertain/rejected commit so the unchanged request can retry; never delete on uncertainty.
  await runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    if (await existing(tx)) return
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.create(target, requestId, { portfolio_id: portfolioId, file_name: fileName, file_type: contentType, size_bytes: file.data.length, ...stored, uploaded_at: new Date().toISOString().slice(0, 10), notes, upload_request: fingerprint, created: stamp, updated: stamp })
  })
  return { id: requestId }
}
