import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction, type GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readPortfolioMutationActor, requirePortfolioMutationAuthority } from 'fireux-properties/runtime/portfolio/server/team/authority'
import { TaskModel } from '../../models/task.model'

function invalid(): never { throw createError({ statusCode: 400, statusMessage: 'Invalid Task input.' }) }
function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !allowed.includes(key))) invalid()
  return value
}
function readChanges(input: unknown) {
  const value = fields(input, ['title', 'description', 'status', 'source', 'due_date', 'linked_entity_type', 'linked_entity_id'])
  if (!Object.keys(value).length) invalid()
  const result = { ...value }
  for (const key of ['title', 'description', 'due_date', 'linked_entity_type', 'linked_entity_id']) {
    if (!(key in result)) continue
    if (typeof result[key] !== 'string') invalid()
    result[key] = (result[key] as string).trim()
  }
  if ('title' in result && !result.title) invalid()
  if ('status' in result && !['open', 'in_progress', 'done'].includes(result.status as string)) invalid()
  if ('source' in result && !['manual', 'compliance', 'documents'].includes(result.source as string)) invalid()
  if (result.due_date) {
    const date = result.due_date as string
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0,10) !== date) invalid()
  }
  return result
}
const target = (portfolioId: string) => defineFirestoreMutationTarget({ key: 'portfolio.tasks', lane: 'server', verbs: ['create', 'update'], database: { kind: 'runtime' }, collectionPath: `portfolios/${portfolioId}/tasks` })
/** Caller must establish Portfolio authority in this same transaction before staging writes. */
export function stagePortfolioTaskCreate(tx: GuardedServerTransaction, actor: Awaited<ReturnType<typeof readPortfolioMutationActor>>, portfolioId: string, id: string, input: unknown) {
  requireFirestoreDocumentId(portfolioId, 'Portfolio id')
  requireFirestoreDocumentId(id, 'Task id')
  const draft = readChanges(input)
  if (!draft.title) invalid()
  const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
  const { id: _id, ...defaults } = TaskModel
  tx.create(target(portfolioId), id, { ...defaults, ...draft, portfolio_id: portfolioId, created: stamp, updated: stamp })
}
export async function createPortfolioTask(event: H3Event, input: unknown) {
  const value = fields(input, ['portfolioId', 'draft'])
  const portfolioId = requireFirestoreDocumentId(value.portfolioId, 'Portfolio id')
  const draft = readChanges(value.draft)
  if (!draft.title) invalid()
  const actor = await readPortfolioMutationActor(event), id = randomUUID()
  await runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requirePortfolioMutationAuthority(tx, actor, portfolioId)
    stagePortfolioTaskCreate(tx, actor, portfolioId, id, draft)
  })
  return { id, portfolioId, ok: true as const }
}
export async function updatePortfolioTask(event: H3Event, input: unknown) {
  const value = fields(input, ['portfolioId', 'taskId', 'changes'])
  const portfolioId = requireFirestoreDocumentId(value.portfolioId, 'Portfolio id')
  const taskId = requireFirestoreDocumentId(value.taskId, 'Task id')
  const changes = readChanges(value.changes), actor = await readPortfolioMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requirePortfolioMutationAuthority(tx, actor, portfolioId)
    const task = await tx.read(target(portfolioId), taskId)
    if (!task.exists) throw createError({ statusCode: 404, statusMessage: 'Task was not found in this Portfolio.' })
    tx.update(target(portfolioId), taskId, { ...changes, updated: serverAuditStamp({ by: actor.uid }) })
  })
  return { id: taskId, portfolioId, ok: true as const }
}
