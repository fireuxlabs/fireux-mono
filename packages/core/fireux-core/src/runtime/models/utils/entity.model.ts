// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority: classify independent Property entities without folding them into Portfolio.
// Concurrent edit — 2026-07-20 23:40 CEST — Entity Vocabulary + Matrix Pass: separate identity, authority, App support, and public-read contracts.
export type FireuxEntityKind =
  | 'entity'
  | 'record'
  | 'shape'
  | 'primitive'
  | 'bucket'
  | 'to-confirm'

export type FireuxEntityIdentity =
  | 'root'
  | 'parent-scoped'
  | 'none'
  | 'to-confirm'

export type FireuxEntityAuthority =
  | 'owning-app-database'
  | 'ecosystem-identity-database'
  | 'fireux-control-plane'
  | 'identity-database'
  | 'parent'
  | 'to-confirm'

export type FireuxEntityAppSupport =
  | 'none'
  | 'access-record'
  | 'membership-record'
  | 'operational-record'
  | 'profile-delta'
  | 'to-confirm'

export type FireuxEntityPublicRead =
  | 'none'
  | 'direct-root'
  | 'projection'
  | 'to-confirm'

export type FireuxEntityFamily =
  | 'core'
  | 'identity'
  | 'system'
  | 'console-entity'
  | 'content'
  | 'commerce'
  | 'kitchen'
  | 'menu'
  | 'place'
  | 'supplier'
  | 'property'
  | 'portfolio'
  | 'profile'
  | 'support'
  | 'to-confirm'

export type FireuxEntityStatus = 'confirmed' | 'to-confirm'

export type FireuxEntityDefinition = {
  kind: FireuxEntityKind
  name: string
  family: FireuxEntityFamily | FireuxEntityFamily[]
  identity: FireuxEntityIdentity
  authority: FireuxEntityAuthority
  appSupport: FireuxEntityAppSupport
  publicRead: FireuxEntityPublicRead
  status: FireuxEntityStatus
  console?: boolean
  root?: string
  scoped?: string
  appSupportPath?: string
  parent?: string
  notes?: string[]
}

export function defineFireuxEntity<T extends FireuxEntityDefinition>(
  definition: T
): T {
  return definition
}
