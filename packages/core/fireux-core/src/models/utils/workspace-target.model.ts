export const CONSOLE_TARGET_LIMIT = 50

export type WorkspaceTargetIdItem = {
  id: string
}

export type WorkspaceTargetsResponse<TItem extends WorkspaceTargetIdItem = WorkspaceTargetIdItem> = {
  ok: true
  appId?: string
  family: string
  items: TItem[]
}
