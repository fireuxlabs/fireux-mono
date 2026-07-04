type MenuSurfaceView = 'browse' | 'order'

export const readMenuViews = (
  _data: Record<string, unknown>,
  orderingEnabled: boolean
) => {
  const views: MenuSurfaceView[] = orderingEnabled ? ['browse', 'order'] : []

  return views.filter((view, index, views) =>
    views.indexOf(view) === index
  )
}
