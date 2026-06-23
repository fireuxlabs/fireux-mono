import {
  menuSurfaceList,
  menuSurfaceText,
} from './menu-surface-types.ts'

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
  // Public menu view spine: docs/concepts/family-menu.md. Browse is implicit for every structured menu; stored views only add extra modes such as order.
  const configured = menuSurfaceList(data.public_views)
    .map(menuView)
    .filter((view): view is MenuSurfaceView =>
      menuViews.includes(view as MenuSurfaceView)
    )
  const extras = configured.filter((view) => view !== 'browse')
  const views: MenuSurfaceView[] = orderingEnabled
    ? extras.length ? extras : ['order']
    : []

  return views.filter((view, index, views) =>
    views.indexOf(view) === index
  )
}
