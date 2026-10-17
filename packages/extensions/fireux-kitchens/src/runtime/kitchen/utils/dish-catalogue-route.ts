export const dishCataloguePath = '/workspace/kitchen/food/dishes'

export type DishCatalogueState = {
  kind: 'all' | 'food' | 'drink'
  search: string
  category: string
  filter: 'all' | 'image' | 'description'
  layout: 'list' | 'grid'
  page: number
}

export function readDishCatalogueQuery(
  query: Record<string, unknown>
): DishCatalogueState {
  const page = typeof query.page === 'string' ? Number(query.page) : 1
  return {
    kind: query.kind === 'food' || query.kind === 'drink' ? query.kind : 'all',
    search: typeof query.search === 'string' ? query.search : '',
    category: typeof query.category === 'string' ? query.category : 'all',
    filter:
      query.filter === 'image' || query.filter === 'description'
        ? query.filter
        : 'all',
    layout: query.layout === 'grid' ? 'grid' : 'list',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

export function dishCatalogueQuery(
  state: DishCatalogueState
): Record<string, string> {
  return {
    kind: state.kind,
    search: state.search,
    category: state.category,
    filter: state.filter,
    layout: state.layout,
    page: String(state.page),
  }
}

export function dishCatalogueReturn(query: Record<string, unknown>) {
  return {
    path: dishCataloguePath,
    query: dishCatalogueQuery(readDishCatalogueQuery(query)),
  }
}
