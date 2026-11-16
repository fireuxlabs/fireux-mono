import type { Menu } from '../../models/menu-storage.model.ts'
import { normalizeMenuMetadataPatch } from './metadata'
export type MenuCreateInput = {
  kitchenId?: string
  name: string
  description?: string
  status?: 'draft'
  format?: 'interactive' | 'document'
  schedule?: 'regular' | 'daily'
  purpose?: 'specials'
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
          'format',
          'purpose',
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
  if (
    'format' in value &&
    value.format !== 'interactive' &&
    value.format !== 'document'
  )
    throw new Error('Choose an interactive or document Menu.')
  if (value.schedule === 'daily' && value.format === 'document')
    throw new Error('Daily specials cannot be document Menus.')
  if (
    'purpose' in value &&
    (value.purpose !== 'specials' || value.schedule !== 'daily')
  )
    throw new Error('A specials board requires a daily Menu.')
  const metadata = normalizeMenuMetadataPatch({
    name: value.name,
    ...('description' in value ? { description: value.description } : {}),
  })
  return {
    ...metadata,
    name: metadata.name!,
    ...(value.purpose === 'specials' ? { purpose: 'specials' as const } : {}),
    ...(value.format
      ? { format: value.format as MenuCreateInput['format'] }
      : {}),
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
    format: value.format || 'interactive',
    sort_order: 0,
    ...(value.purpose === 'specials' ? { purpose: 'specials' as const } : {}),
    ...(value.schedule === 'daily' ? { schedule: 'daily' as const } : {}),
    ...(value.description ? { description: value.description } : {}),
  }
}
