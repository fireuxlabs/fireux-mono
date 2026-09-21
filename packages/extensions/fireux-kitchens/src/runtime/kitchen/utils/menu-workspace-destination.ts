/** Preserve the existing useful entry for regular and daily Menus. */
export function menuWorkspaceDestination(menu: {
  slug?: string
  schedule?: string
}) {
  return `/workspace/kitchen/menus/${encodeURIComponent(menu.slug || '')}${menu.schedule === 'daily' ? '/content' : ''}`
}
