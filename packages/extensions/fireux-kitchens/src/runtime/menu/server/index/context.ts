import { readKitchenPresentation } from '../../../kitchen/utils/kitchen-presentation'
import { readKitchenOfferings } from '../../../kitchen/server/offerings/read'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { MenuDirectoryKitchen } from '../../models/menu-directory.response.ts'
import { readMenuKitchenPlaceData } from '../ownership/kitchen-scope'
import type { TenantMenuScope } from '../ownership/target-types'

export type MenuDirectoryContext = {
  kitchenOfferings?: unknown
  kitchen?: MenuDirectoryKitchen
  kitchenName?: string
  kitchenSlug?: string
}

export async function readScopedMenuDirectoryContext(
  _db: ReturnType<typeof getRuntimeFirestore>,
  scope: TenantMenuScope
): Promise<MenuDirectoryContext> {
  const placeData = await readMenuKitchenPlaceData(scope.kitchenId)
  const identity = readKitchenPresentation(scope.rootKitchenData, placeData)
  const kitchen = identity.name
    ? {
        name: identity.name,
        ...(identity.tagline ? { description: identity.tagline } : {}),
        ...(identity.logoImageUrl
          ? { logo_image_url: identity.logoImageUrl }
          : {}),
        ...(identity.imageUrl ? { image_url: identity.imageUrl } : {}),
        ...(identity.imageShade ? { image_shade: identity.imageShade } : {}),
      }
    : undefined
  return {
    kitchenOfferings: await readKitchenOfferings(_db, scope.kitchenId),
    ...(kitchen ? { kitchen } : {}),
    ...(identity.name ? { kitchenName: identity.name } : {}),
  }
}
