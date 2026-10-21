import type { Menu } from '../../menu/models/menu.model'

type ServiceMenu = Pick<
  Menu,
  | 'id'
  | 'name'
  | 'internal_name'
  | 'status'
  | 'format'
  | 'schedule'
  | 'doc'
  | 'audience'
>

/** Public services use regular structured menus; drafts may be configured before publication. */
export function isServiceMenu(menu: Partial<ServiceMenu>) {
  return (
    (menu.audience === undefined || menu.audience === 'public') &&
    menu.format !== 'document' &&
    menu.schedule !== 'daily' &&
    menu.status !== 'archived' &&
    !menu.doc?.url?.trim()
  )
}

export function serviceMenuReadiness(
  ids: string[],
  menus: Partial<ServiceMenu>[]
) {
  const selected = ids.map((id) => menus.find((menu) => menu.id === id))
  const validSelection =
    selected.length > 0 && selected.every((menu) => menu && isServiceMenu(menu))
  const hasPublishedMenu = selected.some(
    (menu) => menu && isServiceMenu(menu) && menu.status === 'published'
  )
  return {
    validSelection,
    hasPublishedMenu,
    canEnable: validSelection && hasPublishedMenu,
  }
}

export function serviceMenuOptions(
  menus: ServiceMenu[],
  selectedIds: string[] = []
) {
  const options = menus
    .filter((menu) => isServiceMenu(menu) || selectedIds.includes(menu.id))
    .map((menu) => ({
      value: menu.id,
      label: menu.internal_name?.trim() || menu.name,
      description: !isServiceMenu(menu)
        ? menu.audience && menu.audience !== 'public'
          ? 'Not public · remove from selection'
          : 'Unavailable for this service · remove from selection'
        : menu.status === 'published'
          ? undefined
          : 'Draft · not available to customers',
    }))
  for (const id of selectedIds) {
    if (!menus.some((menu) => menu.id === id))
      options.push({
        value: id,
        label: 'Unavailable menu',
        description: 'Menu no longer available · remove from selection',
      })
  }
  return options
}
