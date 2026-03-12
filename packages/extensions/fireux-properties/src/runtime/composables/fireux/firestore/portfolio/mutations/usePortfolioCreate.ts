import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import type { Portfolio } from '../../../../../models/portfolio.model'

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

  return { createPortfolio }
}
