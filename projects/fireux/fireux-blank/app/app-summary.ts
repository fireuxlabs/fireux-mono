import type { App } from 'fireux-core/app'

export type AppSummary = Pick<App, 'id' | 'name'>

export function readAppSummary(id: App['id'], name: unknown): AppSummary | null {
  return typeof name === 'string' && name.trim()
    ? { id, name }
    : null
}
