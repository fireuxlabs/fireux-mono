import { normalizePortfolio } from '../../utils/normalize-portfolio'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { PORTFOLIO_MUTATION_TARGETS } from '../mutation-targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readPortfolioMutationActor,
  requirePortfolioMutationAuthority,
} from '../team/authority'

const limits = {
  name: 120,
  tagline: 120,
  owner_label: 120,
  strategy_label: 120,
  region_label: 120,
  notes: 240,
} as const
function invalid(): never {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid Portfolio identity input.',
  })
}
export async function updatePortfolioIdentity(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some((key) => !['portfolioId', 'changes'].includes(key))
  )
    invalid()
  const portfolioId = requireFirestoreDocumentId(
    value.portfolioId,
    'Portfolio id'
  )
  if (
    !value.changes ||
    typeof value.changes !== 'object' ||
    Array.isArray(value.changes)
  )
    invalid()
  const patch = value.changes as Record<string, unknown>
  if (Object.keys(patch).length !== 1 || !patch.identity || typeof patch.identity !== 'object' || Array.isArray(patch.identity)) invalid()
  const changes: Record<string, string> = {}
  for (const [key, raw] of Object.entries(patch.identity)) {
    if (
      !Object.prototype.hasOwnProperty.call(limits, key) ||
      typeof raw !== 'string'
    )
      invalid()
    const text = raw.trim()
    if (
      text.length > limits[key as keyof typeof limits] ||
      (key === 'name' && !text)
    )
      invalid()
    changes[`identity.${key}`] = text
  }
  if (!Object.keys(changes).length) invalid()
  const actor = await readPortfolioMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { rootData } = await requirePortfolioMutationAuthority(tx, actor, portfolioId)
    if (!normalizePortfolio(portfolioId, rootData))
      throw createError({ statusCode: 409, statusMessage: 'Portfolio source is invalid.' })
    tx.update(PORTFOLIO_MUTATION_TARGETS.portfolios, portfolioId, {
      ...changes,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, portfolioId }
}
