import type { MenuItem } from './menu-item'
export function normalizeMenuItemPatch(patch: Partial<MenuItem>): Partial<MenuItem> {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) || !Object.keys(patch).length || Object.keys(patch).some(key => !['status','sort_order'].includes(key))) throw new Error('Menu placements only support availability and display order. Edit pricing on the Dish.')
  if ('status' in patch && !['active','archived'].includes(String(patch.status))) throw new Error('Invalid menu item availability.')
  if ('sort_order' in patch && (typeof patch.sort_order !== 'number' || !Number.isFinite(patch.sort_order))) throw new Error('Invalid item order.')
  return {...patch}
}
