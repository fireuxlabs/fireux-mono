import { doc, getDoc } from 'firebase/firestore'
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
  ConsoleRootEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useConsoleEnsure } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { Portfolio, PortfolioApp } from '../../../../../models/portfolio.model'

const toSlug = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export type PortfolioCreateOptions = {
  collectionPath?: string
  test?: boolean
}

export type EnsurePortfolioOptions = {
  mode?: ConsoleCreateMode
  existingRootId?: string | null
}

export type PortfolioCreateInput = {
  name: string
  slug?: string
  owner_label?: string
  status?: 'active' | 'archived'
  strategy_label?: string
  region_label?: string
  notes?: string
}

export function usePortfolioCreate(options: PortfolioCreateOptions = {}) {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { ensureConsole } = useConsoleEnsure()
  const collectionPath =
    options.test === true ? 'test-portfolios' : String(options.collectionPath || 'portfolios').trim() || 'portfolios'

  async function createPortfolio(input: PortfolioCreateInput): Promise<string> {
    const name = String(input?.name || '').trim()
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
      name,
      slug,
      owner_label: String(input?.owner_label || '').trim(),
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

  async function ensurePortfolio(
    input: PortfolioCreateInput,
    ensureOptions: EnsurePortfolioOptions = {}
  ): Promise<ConsoleEnsureResult> {
    const requestedRootId = String(ensureOptions.existingRootId || '').trim()

    const ensureRoot = async (): Promise<ConsoleRootEnsureResult> => {
      const name = String(input?.name || '').trim()
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
        name,
        slug,
        owner_label: String(input?.owner_label || '').trim(),
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

    return ensureConsole<PortfolioApp>({
      type: 'portfolio',
      mode: ensureOptions.mode ?? 'console',
      existingRootId: requestedRootId || undefined,
      ensureRoot,
      createOverlay: async () =>
        ({
          admin_ids: [] as string[],
          join_requests: [] as string[],
          console_enabled: true,
        }) as PortfolioApp,
    })
  }

  return { createPortfolio, ensurePortfolio }
}
