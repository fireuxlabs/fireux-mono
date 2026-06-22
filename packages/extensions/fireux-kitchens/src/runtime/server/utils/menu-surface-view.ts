import {
  menuSurfaceList,
  menuSurfaceText,
} from './menu-surface-types.ts'

const menuViews = ['browse', 'order'] as const

const menuView = (value: unknown) => {
  const view = menuSurfaceText(value)
  if (view === 'classic' || view === 'read') return 'browse'
  return view
}

export const readMenuViews = (
  data: Record<string, unknown>,
  orderingEnabled: boolean
) => {
  const configured = menuSurfaceList(data.public_views)
    .map(menuView)
    .filter((view): view is (typeof menuViews)[number] =>
      menuViews.includes(view as (typeof menuViews)[number])
    )

  const fallback = orderingEnabled ? [...menuViews] : ['browse']
  const views = configured.length ? configured : fallback

  return views.filter((view) => view === 'browse' || orderingEnabled)
}
