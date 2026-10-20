/** Every Menu has one canonical record destination. */
export function menuWorkspaceDestination(menu: {
  slug?: string
  schedule?: string
}) {
  return `/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(menu.slug || '')}`
}
