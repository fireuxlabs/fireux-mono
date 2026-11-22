export type WorkspaceEntityCreationIdentity =
  | { intent: 'create_shell'; ownerUserId: string }
  | { intent: 'use_source'; sourceId: string }

const requiredId = (value: unknown, label: string) => {
  const id = String(value ?? '').trim()
  if (!id) throw new Error(`${label} is required.`)
  return id
}

export function resolveWorkspaceEntityCreationId(
  input: WorkspaceEntityCreationIdentity
) {
  if (input.intent === 'create_shell') {
    return requiredId(input.ownerUserId, 'Owner User id')
  }
  if (input.intent === 'use_source') {
    return requiredId(input.sourceId, 'Source id')
  }
  throw new Error('Workspace Entity creation intent is required.')
}
