import {
  createMembershipAccess,
  readMembershipAccessIds,
} from 'fireux-core/runtime/app/utils/membership-access'
import { serverPortfolioAccessTarget } from '../../../utils/access'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverPortfolioTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  assertManagement,
  requireMemberRole,
  runtimePolicy,
  type Actor,
} from './authority'
import {
  fail,
  portfolioDraft,
  request,
  text,
  type PortfolioOnboardingCompleteResult,
} from './input'

export type { PortfolioOnboardingCompleteResult } from './input'

async function actor(event: H3Event): Promise<Actor> {
  const { uid, decoded } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  return {
    ...policy,
    uid,
    name: text(decoded.name) || text(decoded.email) || 'Team member',
  }
}

export async function completePortfolioOnboarding(
  event: H3Event,
  input: unknown
): Promise<PortfolioOnboardingCompleteResult> {
  const body = request(
    input,
    ['input', 'existing_root_id'],
    'Portfolio onboarding request'
  )
  const existingRootId = text(body.existing_root_id)
  if (existingRootId && body.input !== undefined) {
    fail(400, 'Existing Portfolio attachment accepts only existing_root_id.')
  }
  const draft = existingRootId ? null : portfolioDraft(body.input)
  const portfolioId = existingRootId
    ? requireFirestoreDocumentId(existingRootId, 'Portfolio id')
    : draft!.slug
  const current = await actor(event)
  const subscriptionCapacity = useFireUXConfig(event).subscriptionCapacity

  const memberships = serverAppUsersTarget(current.appId)
  const grants = serverPortfolioAccessTarget(current.appId)
  const portfolios = FIRESTORE_MUTATION_TARGETS.portfolios
  const team = serverPortfolioTeamMembersTarget(portfolioId)

  return runGuardedServerTransaction(portfolios.database, async (mutations) => {
    const [membership, root, teamMember, accessRecord] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, current.uid),
      mutations.read<Record<string, unknown>>(portfolios, portfolioId),
      mutations.read<Record<string, unknown>>(team, current.uid),
      mutations.read<Record<string, unknown>>(grants, current.uid),
    ])
    const role = requireMemberRole(membership.exists, membership.data?.role)
    const rootData = root.exists ? root.data || {} : null
    if (existingRootId && !rootData) fail(404, 'Portfolio not found.')
    if (!existingRootId && rootData) {
      fail(409, 'A Portfolio with this id already exists.')
    }
    if (!rootData && teamMember.exists) {
      fail(409, 'Portfolio Team membership exists without its canonical root.')
    }

    const management = rootData
      ? assertManagement(rootData, current.appId, current.ecosystem)
      : null
    const createdRoot = !root.exists
    const createdTeamMember = !teamMember.exists

    const portfolioIds = readMembershipAccessIds(
      accessRecord.data,
      membership.data
    )
    const associated = portfolioIds.includes(portfolioId)
    const access = resolveAppUserAccess(membership.data)
    if (!access.hasMembership)
      fail(409, 'Current App membership has an invalid subscription.')
    if (createdRoot && !current.canCreate)
      fail(403, 'Portfolio creation is disabled for this App.')
    if (!createdRoot && !associated && role !== 'admin' && role !== 'dev')
      fail(403, 'An App admin must connect the Portfolio.')
    if (
      !associated &&
      !hasAppSubscriptionCapacity(
        subscriptionCapacity,
        'portfolio',
        access.subscription,
        portfolioIds.length
      )
    )
      fail(403, 'Your subscription has no Portfolio places available.')

    if (createdRoot) {
      if (!draft)
        fail(409, 'Portfolio creation input changed during onboarding.')
      mutations.create(portfolios, portfolioId, {
        management: current.management,
        name: draft.name,
        tagline: draft.tagline,
        image_url: draft.imageUrl,
        slug: draft.slug,
        owner_label: draft.ownerLabel,
        status: draft.status,
        strategy_label: draft.strategyLabel,
        region_label: draft.regionLabel,
        notes: draft.notes,
        created: serverAuditStamp({
          by: current.uid,
          appId: current.appId,
        }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      if (!management) {
        fail(500, 'Portfolio management validation did not complete.')
      }
      if (JSON.stringify(management) !== JSON.stringify(current.management)) {
        mutations.update(portfolios, portfolioId, {
          management: current.management,
          updated: serverAuditStamp({ by: current.uid }),
        })
      }
    }

    if (createdTeamMember) {
      mutations.create(team, current.uid, {
        name: current.name,
        user_id: current.uid,
        role_ids: [],
      })
    }
    const nextAccess = createMembershipAccess(
      [...new Set([...portfolioIds, portfolioId])],
      membership.data
    )
    if (accessRecord.exists) mutations.update(grants, current.uid, nextAccess)
    else mutations.create(grants, current.uid, nextAccess)

    return {
      ok: true,
      portfolio_id: portfolioId,
      created_root: createdRoot,
      created_team_member: createdTeamMember,
    }
  })
}
