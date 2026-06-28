export type KitchenMenuRouteMode =
  | 'single-kitchen-app'
  | 'kitchen-directory'

const text = (value: unknown) => String(value ?? '').trim()
const segment = (value: unknown) => encodeURIComponent(text(value))

export function kitchenMenuRouteMode(appKitchenCount: number) {
  return appKitchenCount === 1 ? 'single-kitchen-app' : 'kitchen-directory'
}

export function kitchenMenuIndexPath(options: {
  mode: KitchenMenuRouteMode
  kitchenSlug: unknown
}) {
  if (options.mode === 'single-kitchen-app') return '/menus'

  const kitchenSlug = segment(options.kitchenSlug)
  return kitchenSlug ? `/kitchens/${kitchenSlug}/menus` : ''
}

export function kitchenMenuPath(options: {
  mode: KitchenMenuRouteMode
  kitchenSlug: unknown
  menuId: unknown
}) {
  const indexPath = kitchenMenuIndexPath(options)
  const menuId = segment(options.menuId)

  return indexPath && menuId ? `${indexPath}/${menuId}` : ''
}
