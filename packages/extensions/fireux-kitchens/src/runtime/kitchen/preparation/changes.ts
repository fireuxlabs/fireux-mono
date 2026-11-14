import type { Preparation } from './models/model'
export type PreparationChanges = Partial<
  Pick<Preparation, 'name' | 'description'>
>
export function readPreparationChanges(value: unknown): PreparationChanges {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Enter Preparation changes.')
  const source = value as Record<string, unknown>
  if (
    !Object.keys(source).length ||
    Object.keys(source).some((key) => !['name', 'description'].includes(key))
  )
    throw new Error('Unsupported Preparation field.')
  const changes: PreparationChanges = {}
  for (const key of ['name', 'description'] as const) {
    if (!(key in source)) continue
    if (
      typeof source[key] !== 'string' ||
      source[key].length > (key === 'name' ? 140 : 2000)
    )
      throw new Error(`Enter a valid Preparation ${key}.`)
    const text = source[key].trim()
    if (key === 'name' && !text) throw new Error('Enter a Preparation name.')
    changes[key] = text
  }
  return changes
}
