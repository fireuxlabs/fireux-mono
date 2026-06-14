export type KitchenPublicMenuRouteMode =
  | 'single-kitchen-app'
  | 'kitchen-directory'

const text = (value: unknown) => String(value ?? '').trim()
const segment = (value: unknown) => encodeURIComponent(text(value))

export function kitchenPublicMenuRouteMode(appKitchenCount: number) {
  return appKitchenCount === 1 ? 'single-kitchen-app' : 'kitchen-directory'
}

export function kitchenPublicMenuIndexPath(options: {
  mode: KitchenPublicMenuRouteMode
  kitchenSlug: unknown
}) {
  if (options.mode === 'single-kitchen-app') return '/menus'

  const kitchenSlug = segment(options.kitchenSlug)
  return kitchenSlug ? `/kitchens/${kitchenSlug}/menus` : ''
}

export function kitchenPublicMenuPath(options: {
  mode: KitchenPublicMenuRouteMode
  kitchenSlug: unknown
  menuId: unknown
}) {
  const indexPath = kitchenPublicMenuIndexPath(options)
  const menuId = segment(options.menuId)

  return indexPath && menuId ? `${indexPath}/${menuId}` : ''
}
