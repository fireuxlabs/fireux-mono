import type { KitchenMenu as Menu } from '../models/kitchen-menu-storage.model'
import { normalizeMenuMetadataPatch } from './menu-metadata'
export type MenuCreateInput = {
  kitchenId?: string
  name: string
  description?: string
  status?: 'draft'
  schedule?: 'regular' | 'daily'
  doc?: Menu['doc']
}

/** Validate and detach caller input before any credentials or transaction waits. */
export function normalizeMenuCreateInput(input: unknown): MenuCreateInput {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Invalid Menu input.')
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) =>
        ![
          'kitchenId',
          'name',
          'description',
          'status',
          'schedule',
          'doc',
        ].includes(key)
    )
  )
    throw new Error('Unsupported Menu field.')
  if ('kitchenId' in value && typeof value.kitchenId !== 'string')
    throw new Error('Invalid Kitchen id.')
  if ('status' in value && value.status !== 'draft')
    throw new Error('New menus must start as drafts.')
  if (
    'schedule' in value &&
    !['regular', 'daily'].includes(value.schedule as string)
  )
    throw new Error('Choose a valid menu schedule.')
  const metadata = normalizeMenuMetadataPatch({
    name: value.name,
    ...('description' in value ? { description: value.description } : {}),
    ...('doc' in value ? { doc: value.doc } : {}),
  })
  return {
    ...metadata,
    name: metadata.name!,
    ...('kitchenId' in value ? { kitchenId: value.kitchenId as string } : {}),
    ...('status' in value ? { status: 'draft' as const } : {}),
    ...('schedule' in value
      ? { schedule: value.schedule as MenuCreateInput['schedule'] }
      : {}),
  }
}

export function buildMenuPayload(
  input: MenuCreateInput,
  name: string
): Partial<Menu> {
  const value = normalizeMenuCreateInput(input)
  return {
    name,
    status: 'draft',
    sort_order: 0,
    ...(value.schedule === 'daily' ? { schedule: 'daily' as const } : {}),
    ...(value.description ? { description: value.description } : {}),
    ...(value.doc ? { doc: value.doc } : {}),
  }
}
