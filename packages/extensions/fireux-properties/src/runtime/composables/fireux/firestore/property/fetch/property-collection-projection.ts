import type { Property } from '../../../../../models/property.model'
import {
  canonicalPropertyRoot,
  composePropertySurface,
  type PropertySurface,
} from '../utils/view/usePropertyInterface'
import {
  resolvePropertyId,
  type AppPropertyRecord,
  type PropertyCollectionDoc,
  type PropertyCollectionSource,
} from './property-collection-contract'

export function composePropertyCollectionTargets(input: {
  source: PropertyCollectionSource
  usesTargetedRead: boolean
  roots: PropertyCollectionDoc[]
  appSupport: AppPropertyRecord[]
  acceptAppSupport: (
    root: Property,
    appSupport: AppPropertyRecord | undefined
  ) => boolean
}): PropertySurface[] {
  if (input.source === 'demo' || input.source === 'test') return []
  if (!input.usesTargetedRead) {
    return input.roots.reduce<PropertySurface[]>((items, property) => {
      const surface = composePropertySurface({ source: property as Property })
      if (surface) items.push(surface)
      return items
    }, [])
  }

  const rootById = new Map<string, PropertyCollectionDoc>()
  const appSupportById = new Map<string, AppPropertyRecord>()
  for (const property of input.roots) {
    const id = resolvePropertyId(property)
    if (id) rootById.set(id, { ...property, id })
  }
  for (const appSupport of input.appSupport) {
    const id = resolvePropertyId(appSupport)
    if (id) appSupportById.set(id, { ...appSupport, id })
  }

  const merged: PropertySurface[] = []
  const seen = new Set<string>()
  for (const property of input.roots) {
    const id = resolvePropertyId(property)
    if (!id || seen.has(id)) continue
    seen.add(id)
    const root = canonicalPropertyRoot({
      ...(rootById.get(id) ?? {}),
      id,
    } as Property)
    if (!root) continue
    const appSupport = appSupportById.get(id)
    if (!input.acceptAppSupport(root, appSupport)) continue
    const surface = composePropertySurface({ source: root, appSupport })
    if (surface) merged.push(surface)
  }
  return merged
}
