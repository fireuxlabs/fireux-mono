import { FieldValue } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import { hasAppUserPremiumAccess } from 'fireux-core/runtime/utils/app-user-access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  portfolioRootTarget,
  serverAppPortfoliosTarget,
} from '../firestore-targets'
import {
  assertOnboardingAuthority,
  assertScope,
  assertSupportCapacity,
  readSupport,
  requireMemberRole,
  runtimePolicy,
  type Actor,
} from './onboarding-authority'
import {
  fail,
  portfolioDraft,
  request,
  text,
  type PortfolioOnboardingCompleteResult,
} from './onboarding-input'

export type { PortfolioOnboardingCompleteResult } from './onboarding-input'

async function actor(event: H3Event): Promise<Actor> {
  const { uid } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  return { ...policy, uid }
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

  const memberships = serverAppUsersTarget(current.appId)
  const portfolios = portfolioRootTarget
  const supports = serverAppPortfoliosTarget(current.appId)

  return runGuardedServerTransaction(portfolios.database, async (mutations) => {
    const [membership, root, support, operatorSupports] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, current.uid),
      mutations.read<Record<string, unknown>>(portfolios, portfolioId),
      mutations.read<Record<string, unknown>>(supports, portfolioId),
      mutations.query<Record<string, unknown>>(supports, {
        field: 'operator_ids',
        op: 'array-contains',
        value: current.uid,
        limit: 2,
      }),
    ])
    const membershipData = membership.exists ? membership.data || {} : {}
    const role = requireMemberRole(membership.exists, membership.data?.role)
    const rootData = root.exists ? root.data || {} : null
    if (existingRootId && !rootData) {
      fail(404, 'Portfolio not found.')
    }
    const scope = rootData ? assertScope(rootData, current.appId) : null
    const supportData = support.exists ? support.data || {} : null
    if (!rootData && supportData) {
      fail(409, 'Portfolio access exists without its canonical root.')
    }

    const supportAuthority = readSupport(supportData)
    assertOnboardingAuthority({
      rootExists: root.exists,
      support: supportAuthority,
      uid: current.uid,
      role,
      canCreate: current.canCreate,
    })
    if (supportAuthority) {
      assertSupportCapacity(supportAuthority, current.uid)
    }

    if (
      !hasAppUserPremiumAccess(membershipData, {
        isConfiguredDeveloper:
          Boolean(current.developerId) && current.uid === current.developerId,
      })
    ) {
      const otherPortfolio = operatorSupports.find(
        (snapshot) => snapshot.id !== portfolioId
      )
      if (otherPortfolio) {
        fail(
          403,
          'Standard users can only be on one live portfolio team per App. Premium unlocks multiple.'
        )
      }
    }

    const createdRoot = !root.exists
    const createdAppSupport = !support.exists

    if (createdRoot) {
      if (!draft)
        fail(409, 'Portfolio creation input changed during onboarding.')
      mutations.create(portfolios, portfolioId, {
        console: {
          app_id: current.appId,
          app_role: current.appScopeState === 'tenant_app' ? 'tenant' : 'parent',
        },
        name: draft.name,
        tagline: draft.tagline,
        image_url: draft.imageUrl,
        slug: draft.slug,
        owner_label: draft.ownerLabel,
        status: draft.status,
        strategy_label: draft.strategyLabel,
        region_label: draft.regionLabel,
        notes: draft.notes,
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      if (!scope) fail(500, 'Portfolio scope validation did not complete.')
      if (
        scope.state !== current.appScopeState ||
        scope.appId !== current.appId
      ) {
        mutations.update(portfolios, portfolioId, {
          console: {
            app_id: current.appId,
            app_role: current.appScopeState === 'tenant_app' ? 'tenant' : 'parent',
          },
          updated: serverAuditStamp({ by: current.uid }),
        })
      }
    }

    if (createdAppSupport) {
      mutations.create(supports, portfolioId, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      mutations.update(supports, portfolioId, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    mutations.update(memberships, current.uid, {
      console_enabled: true,
      updated: serverAuditStamp({ by: current.uid }),
    })

    return {
      ok: true,
      portfolio_id: portfolioId,
      created_root: createdRoot,
      created_app_support: createdAppSupport,
    }
  })
}
