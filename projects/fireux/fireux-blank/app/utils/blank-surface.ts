import {
  normalizeFireuxAppScopeState,
} from 'fireux-core/runtime/models/utils/meta.model.ts'
import type {
  AppBlank,
  Blank,
  BlankSurface,
} from '../models/blank.model'

const text = (value: unknown) => String(value ?? '').trim()
const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.map((entry) => text(entry)).filter(Boolean))]
    : []

export function composeBlankSurface(parts: {
  blank?: Blank | null
  appSupport?: AppBlank | null
  appId?: string
}): BlankSurface | null {
  const blank = parts.blank
  const appSupport = parts.appSupport
  const id = text(blank?.id)
  const appId = text(parts.appId)
  const scope = normalizeFireuxAppScopeState(blank?.app_scope_state)

  if (
    !blank ||
    !appSupport ||
    !id ||
    text(appSupport.id) !== id ||
    text(appSupport.blank_id) !== id ||
    (scope !== 'parent_app' && scope !== 'tenant_app') ||
    (appId && text(blank.app_scope_app_id) !== appId)
  ) {
    return null
  }

  return {
    ...blank,
    id,
    operator_ids: stringArray(appSupport.operator_ids),
    team_ids: stringArray(appSupport.team_ids),
    join_requests: stringArray(appSupport.join_requests),
  }
}
