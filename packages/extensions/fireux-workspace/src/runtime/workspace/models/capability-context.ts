export type WorkspaceCrudPrimitiveId = 'create' | 'read' | 'update' | 'delete'

export type WorkspaceIntro = {
  title: string
  purpose: string
  data: string
  boundaries: string
  ai: string
  access?: string
  status?: string
  recordCount?: number
  allowance?: {
    description: string
    retained: string
    subscription?: string
    used?: number
    limit?: number | null
    configured: boolean
  }
  tools?: readonly {
    id: string
    label: string
    description: string
    available?: boolean
    reason?: string
  }[]
}

export type WorkspaceCapabilityNative = {
  id: string
  primitive: WorkspaceCrudPrimitiveId
}

export type WorkspaceCapabilityContext = {
  id: string
  subject: string
  primitives: Record<
    WorkspaceCrudPrimitiveId,
    { available: boolean; count?: number; limit?: number | null }
  >
  natives: WorkspaceCapabilityNative[]
  availableActions: WorkspaceCrudPrimitiveId[]
}

export function defineWorkspaceCapabilityContext(
  input: Omit<WorkspaceCapabilityContext, 'availableActions'>
): WorkspaceCapabilityContext {
  return {
    ...input,
    availableActions: (['create', 'read', 'update', 'delete'] as const).filter(
      (id) => input.primitives[id].available
    ),
  }
}
