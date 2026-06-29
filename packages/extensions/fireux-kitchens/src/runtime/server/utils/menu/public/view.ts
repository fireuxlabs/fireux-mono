import {
  menuSurfaceList,
  menuSurfaceText,
} from './types.ts'

const menuViews = ['browse', 'order'] as const
type MenuSurfaceView = typeof menuViews[number]

const menuView = (value: unknown) => {
  const view = menuSurfaceText(value)
  if (view === 'classic' || view === 'read') return 'browse'
  return view
}

export const readMenuViews = (
  data: Record<string, unknown>,
  orderingEnabled: boolean
) => {
  // Public menu view spine: docs/concepts/family-menu.md. Empty means browse-only; stored views are exact allowed public modes.
  const configured = menuSurfaceList(data.public_views)
    .map(menuView)
    .filter((view): view is MenuSurfaceView =>
      menuViews.includes(view as MenuSurfaceView)
    )
  const views: MenuSurfaceView[] = configured.length
    ? configured
    : orderingEnabled
      ? ['browse', 'order']
      : []

  return views.filter((view, index, views) =>
    views.indexOf(view) === index
  )
}
