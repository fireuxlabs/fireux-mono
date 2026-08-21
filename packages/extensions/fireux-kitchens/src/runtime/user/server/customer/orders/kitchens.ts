import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { menuKitchenIdentity } from '../../../../menu/server/ownership/kitchen-scope'

export type CustomerOrderKitchenSummary = {
  name: string
  path: string
  logoImageUrl: string
  imageUrl: string
  imageShade?: 'light' | 'dark' | 'none'
}

export async function readCustomerOrderKitchens(
  db: ReturnType<typeof getRuntimeFirestore>,
  links: Record<string, unknown>[]
) {
  const references = new Map<string, ReturnType<typeof db.doc>>()
  for (const link of links) {
    const kitchenId = text(link.kitchen_id)
    if (!kitchenId) continue
    const rootRef = db.doc(`kitchens/${kitchenId}`)
    references.set(rootRef.path, rootRef)
  }
  if (!references.size) return new Map<string, CustomerOrderKitchenSummary>()

  const snapshots = await db.getAll(...references.values())
  const dataByPath = new Map(
    snapshots.map((snapshot) => [
      snapshot.ref.path,
      snapshot.exists ? snapshot.data() || {} : {},
    ])
  )
  const placeReferences = new Map<string, ReturnType<typeof db.doc>>()
  for (const link of links) {
    const kitchenId = text(link.kitchen_id)
    if (!kitchenId) continue
    const placeRef = db.doc(`${'places'}/${kitchenId}`)
    placeReferences.set(placeRef.path, placeRef)
  }
  if (placeReferences.size) {
    const placeSnapshots = await db.getAll(...placeReferences.values())
    for (const snapshot of placeSnapshots) {
      dataByPath.set(
        snapshot.ref.path,
        snapshot.exists ? snapshot.data() || {} : {}
      )
    }
  }

  return new Map(
    links.flatMap((link) => {
      const kitchenId = text(link.kitchen_id)
      if (!kitchenId) return []
      const rootData = dataByPath.get(`kitchens/${kitchenId}`) || {}
      const placeData =
        dataByPath.get(`${'places'}/${kitchenId}`) || {}
      const identity = menuKitchenIdentity(rootData, placeData)
      const slug = text(rootData.slug)
      return [
        [
          kitchenKey(link),
          {
            name: identity.name,
            path: safeKitchenPath(slug),
            logoImageUrl: identity.logoImageUrl,
            imageUrl: identity.imageUrl,
            imageShade: identity.imageShade,
          },
        ] as const,
      ]
    })
  )
}

export function kitchenKey(link: Record<string, unknown>) {
  return `${text(link.app_id)}/${text(link.kitchen_id)}`
}

function safeKitchenPath(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? `/kitchens/${slug}` : ''
}

function text(value: unknown) {
  return String(value ?? '').trim()
}
