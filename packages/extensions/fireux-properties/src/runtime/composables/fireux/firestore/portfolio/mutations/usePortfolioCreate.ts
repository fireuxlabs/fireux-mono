import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type {
  AppPortfolio,
  Portfolio,
  PortfolioCreateInput,
} from '../../../../../models/portfolio.model'

const toSlug = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeString = (value: unknown) => String(value || '').trim()
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

export type EnsurePortfolioOptions = {
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

export function usePortfolioCreate(options: PortfolioCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureConsole } = useConsoleEnsure()
  const { uid, currentUser } = useAuth()
  const collectionPath =
    options.test === true ? 'test-portfolios' : String(options.collectionPath || 'portfolios').trim() || 'portfolios'
  const isTestPortfolioCollection =
    options.test === true || collectionPath === 'test-portfolios'

  async function createTestPortfolio(
    input: PortfolioTestCreateInput = {}
  ): Promise<ConsoleRootEnsureResult> {
    const id = normalizeString(input.id) || normalizeString(uid.value)
    const userLabel =
      normalizeString(input.subtitle) ||
      resolveTestUserLabel(currentUser.value?.displayName, uid.value)
    const name = normalizeString(input.name) || 'Test Portfolio'
    const slug = toSlug(normalizeString(input.slug) || 'test-portfolio')

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
    const slug = toSlug(String(input?.slug || '').trim() || name)

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
      slug,
      owner_label:
        normalizeString(input?.owner_label) ||
        (isTestPortfolioCollection
          ? resolveTestUserLabel(currentUser.value?.displayName, uid.value)
          : ''),
      status: input?.status || 'active',
      strategy_label: String(input?.strategy_label || '').trim(),
      region_label: String(input?.region_label || '').trim(),
      notes: String(input?.notes || '').trim(),
      created: {
        at: {} as any,
        by: undefined,
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

  async function runPortfolioCreate(
    input: PortfolioCreateInput,
    ensureOptions: EnsurePortfolioOptions = {},
    defaultMode: ConsoleCreateMode
  ): Promise<ConsoleEnsureResult> {
    const requestedRootId = String(ensureOptions.existingRootId || '').trim()

    const ensureRoot = async (): Promise<ConsoleRootEnsureResult> => {
      const defaultTestName = isTestPortfolioCollection
        ? `${resolveTestUserLabel(currentUser.value?.displayName, uid.value)} Test Portfolio`
        : ''
      const requestedName = normalizeString(input?.name)
      const name =
        isTestPortfolioCollection && (!requestedName || requestedName === normalizeString(uid.value))
          ? defaultTestName
          : requestedName
      const slug = requestedRootId || toSlug(String(input?.slug || '').trim() || name)

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
        slug,
        owner_label:
          normalizeString(input?.owner_label) ||
          (isTestPortfolioCollection
            ? resolveTestUserLabel(currentUser.value?.displayName, uid.value)
            : ''),
        status: input?.status || 'active',
        strategy_label: String(input?.strategy_label || '').trim(),
        region_label: String(input?.region_label || '').trim(),
        notes: String(input?.notes || '').trim(),
        created: {
          at: {} as any,
          by: undefined,
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

    return ensureConsole<AppPortfolio>({
      type: 'portfolio',
      mode: ensureOptions.mode ?? defaultMode,
      ensureRoot,
      createOverlay: async () =>
        ({
          team_ids: uid.value ? [uid.value] : ([] as string[]),
          join_requests: [] as string[],
        }) as AppPortfolio,
    })
  }

  async function createPortfolio(
    input: PortfolioCreateInput,
    ensureOptions: EnsurePortfolioOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runPortfolioCreate(input, ensureOptions, 'public')
  }

  async function ensurePortfolio(
    input: PortfolioCreateInput,
    ensureOptions: EnsurePortfolioOptions = {}
  ): Promise<ConsoleEnsureResult> {
    return runPortfolioCreate(input, ensureOptions, 'console')
  }

  return { createPortfolio, ensurePortfolio, createPortfolioRoot, createTestPortfolio }
}
