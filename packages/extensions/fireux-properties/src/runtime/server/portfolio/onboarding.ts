// Concurrent edit — 2026-07-21 22:29 CEST — Portfolio atomic attachment: bind root, App support, and UserApp target in one trusted transaction.
// Concurrent edit — 2026-07-21 23:22 CEST — Console family alignment: reject non-canonical Portfolio scope/support instead of repairing compatibility shapes.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import {
  normalizeFireuxAppScopeState,
  resolveFireuxAppScopeStateForRole,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { hasUserAppPremiumAccess } from 'fireux-core/runtime/models/core/supporting/user-app-access.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { PortfolioStorage } from '../../models/portfolio.model.ts'

type Firestore = ReturnType<typeof getRuntimeFirestore>
type MemberRole = 'admin' | 'user'

type RuntimePolicy = {
  appId: string
  appRole: string
  developerId: string
  appScopeState: 'parent_app' | 'tenant_app'
  canCreate: boolean
  targetIds: string[]
}

type Actor = RuntimePolicy & {
  uid: string
  db: Firestore
  membershipRef: ReturnType<Firestore['doc']>
}

type PortfolioDraft = {
  name: string
  tagline: string
  imageUrl: string
  slug: string
  ownerLabel: string
  status: 'active' | 'archived'
  strategyLabel: string
  regionLabel: string
  notes: string
}

export type PortfolioOnboardingCompleteResult = {
  ok: true
  portfolio_id: string
  created_root: boolean
  created_app_support: boolean
}

const text = (value: unknown) => String(value ?? '').trim()
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const record = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown, allowed: readonly string[], label: string) {
  if (!isRecord(value)) fail(400, `${label} must be an object.`)

  const supported = new Set(allowed)
  const unsupported = Object.keys(value).find(key => !supported.has(key))
  if (unsupported) {
    fail(400, `${label} contains unsupported field: ${unsupported}.`)
  }
  return value
}

function boundedText(
  value: unknown,
  maxLength: number,
  label: string,
  required = false
) {
  const resolved = text(value)
  if (required && !resolved) fail(400, `${label} is required.`)
  if (resolved.length > maxLength) fail(400, `${label} is too long.`)
  return resolved
}

function portfolioDraft(value: unknown): PortfolioDraft {
  const source = request(
    value,
    [
      'name',
      'tagline',
      'image_url',
      'slug',
      'owner_label',
      'status',
      'strategy_label',
      'region_label',
      'notes',
    ],
    'Portfolio input'
  )
  const name = boundedText(source.name, 160, 'Portfolio name', true)
  const slug = normalizeSlug(boundedText(source.slug, 240, 'Portfolio slug') || name)
  if (!slug) fail(400, 'Portfolio slug is required.')
  requireFirestoreDocumentId(slug, 'Portfolio id')

  const status = text(source.status) || 'active'
  if (status !== 'active' && status !== 'archived') {
    fail(400, 'Portfolio status is invalid.')
  }

  return {
    name,
    tagline: boundedText(source.tagline, 240, 'Portfolio tagline'),
    imageUrl: boundedText(source.image_url, 2048, 'Portfolio image URL'),
    slug,
    ownerLabel: boundedText(source.owner_label, 160, 'Portfolio owner label'),
    status,
    strategyLabel: boundedText(
      source.strategy_label,
      160,
      'Portfolio strategy label'
    ),
    regionLabel: boundedText(source.region_label, 160, 'Portfolio region label'),
    notes: boundedText(source.notes, 4000, 'Portfolio notes'),
  }
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  const fireux = record(useRuntimeConfig(event).public?.fireux)
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const appRole = text(fireux.role)
  const developerId = text(fireux.developerId)
  const appScopeState = resolveFireuxAppScopeStateForRole(appRole)
  if (!appScopeState) fail(403, 'This App cannot own a Portfolio console.')

  const portfolioConfig = record(record(fireux.consoleConfig).portfolio)
  const canCreate = typeof portfolioConfig.canCreate === 'boolean'
    ? portfolioConfig.canCreate
    : appRole !== 'tenant'
  const targetIds = Array.isArray(portfolioConfig.targetIds)
    ? Array.from(new Set(portfolioConfig.targetIds.map(text).filter(Boolean)))
    : []

  return {
    appId,
    appRole,
    developerId,
    appScopeState,
    canCreate,
    targetIds,
  }
}

async function actor(event: H3Event): Promise<Actor> {
  const { uid } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  const db = getRuntimeFirestore()

  return {
    ...policy,
    uid,
    db,
    membershipRef: db.doc(
      `apps/${policy.appId}/${UserAppStorage.collection}/${uid}`
    ),
  }
}

function requireMemberRole(exists: boolean, value: unknown): MemberRole {
  const role = text(value)
  if (!exists || (role !== 'admin' && role !== 'user')) {
    fail(403, 'Current App membership is required to onboard a Portfolio.')
  }
  return role
}

function assertRuntimeTarget(current: RuntimePolicy, portfolioId: string) {
  if (current.appRole !== 'tenant') return
  if (!current.targetIds.includes(portfolioId)) {
    fail(403, 'This Portfolio is not a configured target for the tenant App.')
  }
}

function boundedIds(value: unknown, max: number, label: string) {
  if (!Array.isArray(value) || value.length > max) {
    fail(409, `${label} has an invalid stored shape.`)
  }
  if (value.some(id => typeof id !== 'string')) {
    fail(409, `${label} has invalid stored ids.`)
  }
  const ids = (value as string[]).map(id => id.trim())
  if (
    ids.some((id, index) => !id || id !== value[index]) ||
    new Set(ids).size !== ids.length
  ) {
    fail(409, `${label} has invalid stored ids.`)
  }
  return ids
}

function readSupport(value: Record<string, unknown> | null) {
  if (!value) return null
  return {
    operatorIds: boundedIds(value.operator_ids, 50, 'Portfolio operators'),
    teamIds: boundedIds(value.team_ids, 100, 'Portfolio team'),
    joinRequests: boundedIds(
      value.join_requests,
      100,
      'Portfolio join requests'
    ),
  }
}

function assertMembershipCapacity(
  membership: Record<string, unknown>,
  portfolioId: string
) {
  if (
    membership.console_targets !== undefined &&
    !isRecord(membership.console_targets)
  ) {
    fail(409, 'UserApp Console targets have an invalid stored shape.')
  }
  const targets = record(membership.console_targets)
  if (targets.portfolio_ids === undefined) return

  const ids = boundedIds(
    targets.portfolio_ids,
    50,
    'UserApp Portfolio console targets'
  )
  if (!ids.includes(portfolioId) && ids.length >= 50) {
    fail(409, 'The UserApp Portfolio console target list is full.')
  }
}

function readScope(root: Record<string, unknown>) {
  if (Object.prototype.hasOwnProperty.call(root, 'app_scope')) {
    fail(409, 'Portfolio App scope uses a non-canonical stored shape.')
  }
  const flatState = text(root.app_scope_state)
  const flatAppId = text(root.app_scope_app_id)
  const state = normalizeFireuxAppScopeState(flatState)

  if (!state) fail(409, 'Portfolio App scope is missing or invalid.')
  if (state === 'root_only' && flatAppId) {
    fail(409, 'An unattached Portfolio cannot name an App.')
  }
  if (state !== 'root_only' && !flatAppId) {
    fail(409, 'An attached Portfolio must name its App.')
  }

  return { state, appId: flatAppId }
}

function assertScope(root: Record<string, unknown>, appId: string) {
  const scope = readScope(root)
  if (scope.state !== 'root_only' && scope.appId !== appId) {
    fail(409, 'This Portfolio is already attached to another App.')
  }
  return scope
}

function assertSupportCapacity(
  support: NonNullable<ReturnType<typeof readSupport>>,
  uid: string
) {
  if (!support.operatorIds.includes(uid) && support.operatorIds.length >= 50) {
    fail(409, 'The Portfolio operator list is full.')
  }
  if (!support.teamIds.includes(uid) && support.teamIds.length >= 100) {
    fail(409, 'The Portfolio team list is full.')
  }
}

function assertOnboardingAuthority(input: {
  rootExists: boolean
  support: ReturnType<typeof readSupport>
  uid: string
  role: MemberRole
  canCreate: boolean
}) {
  if (!input.rootExists) {
    if (!input.canCreate) {
      fail(403, 'Portfolio creation is disabled for this App.')
    }
    if (input.role !== 'admin') {
      fail(403, 'An App admin must create the Portfolio.')
    }
    return
  }

  if (input.role === 'admin') return
  if (input.support?.operatorIds.includes(input.uid)) return
  fail(403, 'An App admin or existing Portfolio operator must grant access.')
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
  assertRuntimeTarget(current, portfolioId)

  const rootRef = current.db
    .collection(PortfolioStorage.rootCollection)
    .doc(portfolioId)
  const supportCollection = current.db.collection(
    `apps/${current.appId}/${PortfolioStorage.appSupportCollection}`
  )
  const supportRef = supportCollection.doc(portfolioId)
  const currentOperatorSupports = supportCollection
    .where('operator_ids', 'array-contains', current.uid)
    .limit(2)

  return current.db.runTransaction(async transaction => {
    const [membership, root, support, operatorSupports] = await Promise.all([
      transaction.get(current.membershipRef),
      transaction.get(rootRef),
      transaction.get(supportRef),
      transaction.get(currentOperatorSupports),
    ])
    const membershipData = membership.exists ? membership.data() || {} : {}
    const role = requireMemberRole(membership.exists, membership.get('role'))
    assertMembershipCapacity(membershipData, portfolioId)

    const rootData = root.exists ? root.data() || {} : null
    if (existingRootId && !rootData) {
      fail(404, 'Portfolio not found.')
    }
    const scope = rootData ? assertScope(rootData, current.appId) : null
    const supportData = support.exists ? support.data() || {} : null
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
      !hasUserAppPremiumAccess(membershipData, {
        isConfiguredDeveloper:
          Boolean(current.developerId) &&
          current.uid === current.developerId,
      })
    ) {
      const otherPortfolio = operatorSupports.docs.find(
        snapshot => snapshot.id !== portfolioId
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
      if (!draft) fail(409, 'Portfolio creation input changed during onboarding.')
      transaction.create(rootRef, {
        app_scope_state: current.appScopeState,
        app_scope_app_id: current.appId,
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
        transaction.update(rootRef, {
          app_scope_state: current.appScopeState,
          app_scope_app_id: current.appId,
          updated: serverAuditStamp({ by: current.uid }),
        })
      }
    }

    if (createdAppSupport) {
      transaction.create(supportRef, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      transaction.update(supportRef, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    transaction.update(current.membershipRef, {
      console_enabled: true,
      'console_targets.portfolio_ids': FieldValue.arrayUnion(portfolioId),
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
