import type { FireuxStamps } from './stamps.model'

/** Canonical record foundation. Readers supply id from the document path. */
export type FireuxEntity = {
  id: string
  /** Internal working notes; public projections omit this field. */
  context?: string
  created: FireuxStamps['created']
  updated: FireuxStamps['updated']
}

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
  | 'domain-database'
  | 'ecosystem-identity-database'
  | 'fireux-control-plane'
  | 'identity-database'
  | 'parent'
  | 'to-confirm'

export type FireuxEntityAppSupport = 'none' | 'membership-record' | 'to-confirm'

export type FireuxEntityFamily =
  | 'core'
  | 'identity'
  | 'system'
  | 'workspace-entity'
  | 'content'
  | 'commerce'
  | 'profile'
  | 'support'
  | 'to-confirm'
  | (string & {})

export type FireuxEntityDefinition = {
  kind: FireuxEntityKind
  name: string
  family: FireuxEntityFamily | FireuxEntityFamily[]
  identity: FireuxEntityIdentity
  authority: FireuxEntityAuthority
  appSupport: FireuxEntityAppSupport
  workspace?: boolean
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
