export type FireuxRootOwnerType =
  | 'app'
  | 'ecosystem'
  | 'company'
  | 'place'
  | 'user'

export type FireuxRootVisibility = 'app' | 'ecosystem' | 'public'

export const FireuxRootScope = {
  source_app_id: '' as string,
  source_ecosystem_id: '' as string,
  owner_type: 'app' as FireuxRootOwnerType,
  owner_id: '' as string,
  visibility: 'app' as FireuxRootVisibility,
} as const

export type FireuxRootScope = {
  [K in keyof typeof FireuxRootScope]: (typeof FireuxRootScope)[K]
}

export type FireuxAppScopeState = 'root_only' | 'parent_app' | 'tenant_app'

export const FireuxAppScope = {
  app_scope_state: 'root_only' as FireuxAppScopeState,
  app_scope_app_id: '' as string,
} as const

export type FireuxAppScope = {
  [K in keyof typeof FireuxAppScope]: (typeof FireuxAppScope)[K]
}
