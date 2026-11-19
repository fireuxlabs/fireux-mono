export const itemCataloguePath = '/workspace/kitchen/menu/items'

export type ItemCatalogueState = {
  kind: 'all' | 'food' | 'drink'
  search: string
  filter: 'all' | 'image' | 'description'
  layout: 'list' | 'grid'
  page: number
}

export function readItemCatalogueQuery(
  query: Record<string, unknown>
): ItemCatalogueState {
  const page = typeof query.page === 'string' ? Number(query.page) : 1
  return {
    kind: query.kind === 'food' || query.kind === 'drink' ? query.kind : 'all',
    search: typeof query.search === 'string' ? query.search : '',
    filter:
      query.filter === 'image' || query.filter === 'description'
        ? query.filter
        : 'all',
    layout: query.layout === 'grid' ? 'grid' : 'list',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

export function itemCatalogueReturn(query: Record<string, unknown>) {
  return {
    path: itemCataloguePath,
    query: {
      ...(typeof query.group === 'string' ? { group: query.group } : {}),
    },
  }
}
