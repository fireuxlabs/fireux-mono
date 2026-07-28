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
const UNSUPPORTED_TEST_WRITE_MESSAGE =
  '[fireux-properties] Portfolio Test writes are unsupported: no canonical simulation producer exists.'

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
  const collectionPath = PortfolioStorage.rootCollection

  const requireCanonicalWriteSource = () => {
    if (options.test === true) {
      throw new Error(UNSUPPORTED_TEST_WRITE_MESSAGE)
    }
  }

  async function createTestPortfolio(
    _input: PortfolioTestCreateInput = {}
  ): Promise<ConsoleRootCreateResult> {
    throw new Error(UNSUPPORTED_TEST_WRITE_MESSAGE)
  }

  async function createPortfolioRoot(input: PortfolioCreateInput): Promise<string> {
    requireCanonicalWriteSource()
    const requestedName = normalizeString(input?.name)
    const name = requestedName
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
      owner_label: normalizeString(input?.owner_label),
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
    requireCanonicalWriteSource()
    const requestedRootId = normalizeString(createOptions.existingRootId)
    const requestedName = normalizeString(input?.name)
    const name = requestedName
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
      owner_label: normalizeString(input?.owner_label),
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
    requireCanonicalWriteSource()

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
