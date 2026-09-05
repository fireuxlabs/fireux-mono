import type { AppUser } from '../models/app-user.model'

/** Workspace relationships consume the current App membership allowance. */
export function workspaceAllowanceUsed(membership: Partial<AppUser>) {
  return [
    membership.kitchens,
    membership.projects,
    membership.properties,
    membership.portfolios,
    membership.suppliers,
    membership.blanks,
  ].reduce(
    (count, ids) =>
      count + new Set((ids || []).map((id) => id.trim()).filter(Boolean)).size,
    0
  )
}
