import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
  ConsoleRootCreateResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type {
  AppPortfolio,
  Portfolio,
  PortfolioCreateInput,
} from '../../../../../models/portfolio.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const resolveTestUserLabel = (displayName: unknown, uid: unknown) => {
  const resolvedDisplayName = normalizeString(displayName)
  if (resolvedDisplayName) return resolvedDisplayName

  const resolvedUid = normalizeString(uid)
  if (!resolvedUid) return 'User'

  return `User ${resolvedUid.slice(0, 6)}`
}

export type PortfolioCreateOptions = {
  collectionPath?: string
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

export const PortfolioCreatePlan = defineFireuxCreatePlan({
  family: 'idempotent',
})

export function usePortfolioCreate(options: PortfolioCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { createConsole } = useConsoleCreate()
  const { uid, currentUser } = useAuth()
  const collectionPath =
    options.test === true ? 'test-portfolios' : normalizeString(options.collectionPath || 'portfolios') || 'portfolios'
  const isTestPortfolioCollection =
    options.test === true || collectionPath === 'test-portfolios'

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
      operator_ids: [id],
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
      operator_ids: Array.isArray(input?.operator_ids)
        ? input.operator_ids
        : [],
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
      operator_ids: Array.isArray(input?.operator_ids)
        ? input.operator_ids
        : [],
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

  async function runPortfolioConsoleCreate(
    input: PortfolioCreateInput,
    createOptions: PortfolioCreateModeOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleCreateResult> {
    const createRoot = async (): Promise<ConsoleRootCreateResult> => {
      return createPortfolioRootResult(input, createOptions)
    }

    return createConsole<AppPortfolio>({
      type: 'portfolio',
      mode: createOptions.mode ?? defaultMode,
      createRoot,
      createOverlay: async () =>
        ({
          operator_ids: uid.value ? [uid.value] : ([] as string[]),
          team_ids: uid.value ? [uid.value] : ([] as string[]),
          join_requests: [] as string[],
        }) as AppPortfolio,
    })
  }

  async function createPortfolio(
    input: PortfolioCreateInput,
    createOptions: PortfolioCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    const root = await createPortfolioRootResult(input, createOptions)
    return {
      id: root.id,
      createdRoot: root.created,
      createdOverlay: false,
    }
  }

  async function createPortfolioConsole(
    input: PortfolioCreateInput,
    createOptions: PortfolioCreateModeOptions = {}
  ): Promise<ConsoleCreateResult> {
    return runPortfolioConsoleCreate(input, createOptions, 'console')
  }

  return {
    createPlan: PortfolioCreatePlan,
    createPortfolio,
    createPortfolioConsole,
    createPortfolioRoot,
    createTestPortfolio,
  }
}
