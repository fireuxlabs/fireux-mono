export const WORKSPACE_CAPABILITY_SURFACE_FAMILIES = [
  'entity-gate',
  'overview',
  'identity-sheet',
  'team-governance',
  'focus-list',
  'catalogue',
  'relationship-directory',
  'structured-composer',
  'work-queue',
  'event-ledger',
  'calendar',
  'control-checklist',
  'count-stocktake',
  'configuration-sheet',
  'report',
  'asset-vault',
] as const

export const WORKSPACE_CAPABILITY_ENTRY_FAMILIES = [
  'quick-create',
  'search-connect',
  'resolvable-shell',
  'guided-create',
  'import-create',
  'derived-create',
] as const

export const WORKSPACE_CAPABILITY_TOOL_FAMILIES = [
  'record',
  'relationship',
  'lifecycle',
  'workflow',
  'transform',
  'operational',
  'analysis',
] as const

export const WORKSPACE_CAPABILITY_TOOL_SCOPES = [
  'local',
  'compound',
] as const

export type WorkspaceCapabilitySurfaceFamily =
  (typeof WORKSPACE_CAPABILITY_SURFACE_FAMILIES)[number]
export type WorkspaceCapabilityEntryFamily =
  (typeof WORKSPACE_CAPABILITY_ENTRY_FAMILIES)[number]
export type WorkspaceCapabilityToolFamily =
  (typeof WORKSPACE_CAPABILITY_TOOL_FAMILIES)[number]
export type WorkspaceCapabilityToolScope =
  (typeof WORKSPACE_CAPABILITY_TOOL_SCOPES)[number]

export type WorkspaceCapabilityFamilies = {
  surfaces: readonly WorkspaceCapabilitySurfaceFamily[]
  entries: readonly WorkspaceCapabilityEntryFamily[]
  tools: readonly WorkspaceCapabilityToolFamily[]
  scopes: readonly WorkspaceCapabilityToolScope[]
}
