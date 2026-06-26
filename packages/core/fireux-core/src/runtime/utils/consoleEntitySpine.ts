import type {
  FireuxAppScopeState,
  FireuxConsoleEntityAppScope,
  FireuxConsoleEntityIdentity,
  FireuxConsoleEntityVisibility,
} from '../models/core/meta.model'

type ConsoleEntitySpineRecord = Record<string, unknown> | null | undefined

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const bool = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback
const stringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map(text).filter(Boolean)
    : []

export const readConsoleEntityAppScope = (
  value: ConsoleEntitySpineRecord,
  fallbackAppId: unknown = ''
) => {
  const source = record(value)
  const appScope = record(source.app_scope)
  const state =
    (text(appScope.state) || text(source.app_scope_state)) as FireuxAppScopeState | ''
  const appId = text(appScope.app_id) || text(source.app_scope_app_id) || text(fallbackAppId)

  return {
    state,
    appId,
    hasTenantApp: state === 'dedicated_app' && Boolean(appId),
  }
}

export const readConsoleEntityIdentity = (value: ConsoleEntitySpineRecord) => {
  const source = record(value)
  const identity = record(source.identity)
  const displayName =
    text(identity.display_name) ||
    text(source.display_name) ||
    text(source.name) ||
    text(source.short_name)
  const imageUrl =
    text(identity.image_url) ||
    text(source.display_image_url) ||
    text(source.image_url)
  const gallery = stringArray(identity.gallery).length
    ? stringArray(identity.gallery)
    : stringArray(source.food_gallery)

  return {
    displayName,
    tagline: text(identity.tagline) || text(source.tagline),
    imageUrl,
    gallery,
  }
}

export const readConsoleEntityVisibility = (
  value: ConsoleEntitySpineRecord
) => {
  const source = record(value)
  const visibility = record(source.visibility)

  return {
    show: bool(visibility.show, bool(source.show, false)),
    active: bool(visibility.active, bool(source.active, true)),
    isTest: bool(visibility.is_test, bool(source.is_test_kitchen, false)),
  }
}

export const asConsoleEntityAppScope = (
  value: ConsoleEntitySpineRecord,
  fallbackAppId: unknown = ''
): FireuxConsoleEntityAppScope => {
  const appScope = readConsoleEntityAppScope(value, fallbackAppId)

  return {
    state: appScope.state || 'root_only',
    app_id: appScope.appId,
  }
}

export const asConsoleEntityIdentity = (
  value: ConsoleEntitySpineRecord
): FireuxConsoleEntityIdentity => {
  const identity = readConsoleEntityIdentity(value)

  return {
    display_name: identity.displayName,
    tagline: identity.tagline,
    image_url: identity.imageUrl,
    gallery: identity.gallery,
  }
}

export const asConsoleEntityVisibility = (
  value: ConsoleEntitySpineRecord
): FireuxConsoleEntityVisibility => {
  const visibility = readConsoleEntityVisibility(value)

  return {
    show: visibility.show,
    active: visibility.active,
    is_test: visibility.isTest,
  }
}
