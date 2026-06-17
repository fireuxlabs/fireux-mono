export type FireuxEntityKind =
  | 'entity'
  | 'record'
  | 'shape'
  | 'primitive'
  | 'bucket'

export type FireuxEntityStorageScope =
  | 'root'
  | 'scoped'
  | 'both'
  | 'none'
  | 'to-confirm'

export type FireuxEntityFamily =
  | 'core'
  | 'system'
  | 'console-entity'
  | 'content'
  | 'commerce'
  | 'kitchen'
  | 'menu'
  | 'supplier'
  | 'portfolio'
  | 'profile'
  | 'support'
  | 'to-confirm'

export type FireuxEntityStatus = 'confirmed' | 'to-confirm'

export type FireuxEntityDefinition = {
  kind: FireuxEntityKind
  name: string
  family: FireuxEntityFamily | FireuxEntityFamily[]
  storage: FireuxEntityStorageScope
  status?: FireuxEntityStatus
  console?: boolean
  root?: string
  scoped?: string
  parent?: string
  notes?: string[]
}

export function defineFireuxEntity<T extends FireuxEntityDefinition>(
  definition: T
): T {
  return definition
}
