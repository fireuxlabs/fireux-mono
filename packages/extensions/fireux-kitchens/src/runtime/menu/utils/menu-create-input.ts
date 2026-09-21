import type { KitchenMenu as Menu } from './kitchen-menu'
export type MenuCreateInput = {
  kitchenId?: string
  name: string
  description?: string
  status?: Menu['status']
  schedule?: 'regular' | 'daily'
  doc?: Menu['doc']
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
export function buildMenuPayload(
  input: MenuCreateInput,
  name: string
): Partial<Menu> {
  const payload: Partial<Menu> = {
    name,
    status: input.status || 'draft',
    sort_order: 0,
    ...(input.schedule === 'daily' ? { schedule: 'daily' as const } : {}),
  }
  const put = (key: keyof Menu, value: unknown) => {
    const next = normalizeString(value)
    if (next) (payload as Record<string, unknown>)[key] = next
  }

  put('description', input.description)
  if (input.doc) {
    const doc = Object.fromEntries(
      ['url', 'name', 'type', 'storage_path'].map((key) => [
        key,
        normalizeString(input.doc?.[key as keyof NonNullable<Menu['doc']>]),
      ])
    ) as NonNullable<Menu['doc']>
    if (Object.values(doc).some(Boolean)) {
      if (!Object.values(doc).every(Boolean))
        throw new Error('Menu document metadata is incomplete.')
      payload.doc = doc
    }
  }

  return payload
}
