// Concurrent edit — 2026-07-20 22:12 CEST — Both-Entity Authority — Portfolio: keep root creation free of app access fields.
// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: remove caller-selected Portfolio root collection paths.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose explicit App support creation results.
// Concurrent edit — 2026-07-21 22:29 CEST — Portfolio atomic attachment: route live Console creation through trusted onboarding.
// Concurrent edit — 2026-07-21 23:22 CEST — Console family alignment: make existing-root attachment ID-only.
import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type {
  Portfolio,
  PortfolioCreateInput,
} from '../../../../../models/portfolio.model'
import { PortfolioStorage } from '../../../../../models/portfolio.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const resolveTestUserLabel = (displayName: unknown, uid: unknown) => {
  const resolvedDisplayName = normalizeString(displayName)
  if (resolvedDisplayName) return resolvedDisplayName

  const resolvedUid = normalizeString(uid)
  if (!resolvedUid) return 'User'

  return `User ${resolvedUid.slice(0, 6)}`
}

export type PortfolioCreateOptions = {
  test?: boolean
}

export type PortfolioCreateModeOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

type PortfolioTestCreateInput = {
  id?: string
  slug?: string
  name?: string
  subtitle?: string
  image_url?: string
}

type PortfolioOnboardingCompleteResult = {
  ok: true
  portfolio_id: string
  created_root: boolean
  created_app_support: boolean
}

export const PortfolioCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function usePortfolioCreate(options: PortfolioCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { uid, currentUser } = useAuth()
  const collectionPath =
    options.test === true ? 'test-portfolios' : PortfolioStorage.rootCollection
  const isTestPortfolioCollection = options.test === true

  async function createTestPortfolio(
    input: PortfolioTestCreateInput = {}
  ): Promise<ConsoleRootCreateResult> {
    const id = normalizeString(input.id) || normalizeString(uid.value)
    const userLabel =
      normalizeString(input.subtitle) ||
      resolveTestUserLabel(currentUser.value?.displayName, uid.value)
    const name = normalizeString(input.name) || 'Test Portfolio'
    const slug = normalizeSlug(normalizeString(input.slug) || 'test-portfolio')

    if (!id) {
      throw new Error('Test portfolio id is required')
    }

    if (!slug) {
      throw new Error('Test portfolio slug is required')
    }

    const ref = doc(db, 'test-portfolios', id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id, created: false }
    }

    const payload: Partial<Portfolio> & { image_url?: string } = {
      name,
      slug,
      owner_label: userLabel,
      region_label: userLabel,
    }

    const imageUrl = normalizeString(input.image_url)
    if (imageUrl) {
      payload.image_url = imageUrl
    }

    await setDocument<Partial<Portfolio> & { image_url?: string }>(
      'test-portfolios',
      id,
      payload,
      {
        creator: true,
      }
    )

    return { id, created: true }
  }

  async function createPortfolioRoot(input: PortfolioCreateInput): Promise<string> {
    const defaultTestName = isTestPortfolioCollection
      ? `${resolveTestUserLabel(currentUser.value?.displayName, uid.value)} Test Portfolio`
      : ''
    const requestedName = normalizeString(input?.name)
    const name =
      isTestPortfolioCollection && (!requestedName || requestedName === normalizeString(uid.value))
        ? defaultTestName
        : requestedName
    const slug = normalizeSlug(normalizeString(input?.slug) || name)

    if (!name) {
      throw new Error('Portfolio name is required')
    }

    if (!slug) {
      throw new Error('Portfolio slug is required')
    }

    const ref = doc(db, collectionPath, slug)
    const snap = await getDoc(ref)
    if (snap.exists()) return slug

    const payload: Portfolio = {
      id: slug,
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      name,
      tagline: normalizeString(input?.tagline),
      image_url: normalizeString(input?.image_url),
      slug,
      owner_label:
        normalizeString(input?.owner_label) ||
        (isTestPortfolioCollection
          ? resolveTestUserLabel(currentUser.value?.displayName, uid.value)
          : ''),
      status: input?.status || 'active',
      strategy_label: normalizeString(input?.strategy_label),
      region_label: normalizeString(input?.region_label),
      notes: normalizeString(input?.notes),
      created: {
        at: {} as any,
        by: undefined,
        app_id: undefined,
      },
      updated: {
        at: {} as any,
        by: undefined,
      },
    }

    await setDocument<Portfolio>(collectionPath, slug, payload, {
      creator: true,
      app: true,
    })

    return slug
  }

  async function createPortfolioRootResult(
    input: PortfolioCreateInput,
    createOptions: PortfolioCreateModeOptions = {}
  ): Promise<ConsoleRootCreateResult> {
    const requestedRootId = normalizeString(createOptions.existingRootId)
    const defaultTestName = isTestPortfolioCollection
      ? `${resolveTestUserLabel(currentUser.value?.displayName, uid.value)} Test Portfolio`
      : ''
    const requestedName = normalizeString(input?.name)
    const name =
      isTestPortfolioCollection && (!requestedName || requestedName === normalizeString(uid.value))
        ? defaultTestName
        : requestedName
    const slug = requestedRootId || normalizeSlug(normalizeString(input?.slug) || name)

    if (!name) {
      throw new Error('Portfolio name is required')
    }

    if (!slug) {
      throw new Error('Portfolio slug is required')
    }

    const ref = doc(db, collectionPath, slug)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { id: slug, created: false }
    }

    const payload: Portfolio = {
      id: slug,
      app_scope_state: 'root_only',
      app_scope_app_id: '',
      name,
      tagline: normalizeString(input?.tagline),
      image_url: normalizeString(input?.image_url),
      slug,
      owner_label:
        normalizeString(input?.owner_label) ||
        (isTestPortfolioCollection
          ? resolveTestUserLabel(currentUser.value?.displayName, uid.value)
          : ''),
      status: input?.status || 'active',
      strategy_label: normalizeString(input?.strategy_label),
      region_label: normalizeString(input?.region_label),
      notes: normalizeString(input?.notes),
      created: {
        at: {} as any,
        by: undefined,
        app_id: undefined,
      },
      updated: {
        at: {} as any,
        by: undefined,
      },
    }

    await setDocument<Portfolio>(collectionPath, slug, payload, {
      creator: true,
      app: true,
    })

    return { id: slug, created: true }
  }

  async function createPortfolio(
    input: PortfolioCreateInput,
    createOptions: PortfolioCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    const root = await createPortfolioRootResult(input, createOptions)
    return {
      id: root.id,
      createdRoot: root.created,
      createdAppSupport: false,
    }
  }

  async function createPortfolioConsole(
    input: PortfolioCreateInput,
    createOptions: PortfolioCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    if (isTestPortfolioCollection) {
      throw new Error('Test Portfolio creation does not use live Console onboarding.')
    }

    const user = await useRequireUser()
    const token = await user.getIdToken()
    const existingRootId = normalizeString(createOptions.existingRootId)
    const result = await $fetch<PortfolioOnboardingCompleteResult>(
      '/api/portfolios/onboarding/complete',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: existingRootId
          ? { existing_root_id: existingRootId }
          : {
              input: {
                name: normalizeString(input?.name),
                tagline: normalizeString(input?.tagline),
                image_url: normalizeString(input?.image_url),
                slug: normalizeString(input?.slug),
                owner_label: normalizeString(input?.owner_label),
                status: input?.status || 'active',
                strategy_label: normalizeString(input?.strategy_label),
                region_label: normalizeString(input?.region_label),
                notes: normalizeString(input?.notes),
              },
            },
      }
    )
    if (result?.ok !== true || !normalizeString(result.portfolio_id)) {
      throw new Error('Portfolio onboarding completion was invalid.')
    }

    return {
      id: result.portfolio_id,
      createdRoot: result.created_root,
      createdAppSupport: result.created_app_support,
    }
  }

  return {
    createPlan: PortfolioCreatePlan,
    createPortfolio,
    createPortfolioConsole,
    createPortfolioRoot,
    createTestPortfolio,
  }
}
