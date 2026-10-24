// Routing owns stable path/key translation only. It does not decide which
// routes appear in navigation, or whether the current user may access them.
export const CONSOLE_ROOT = '/workspace'

export type WorkspaceFamily = string

export function normalizeWorkspaceFamily(value: unknown): WorkspaceFamily | '' {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  return normalized
}

export function workspaceFamilyFromPath(path: string): WorkspaceFamily | '' {
  return normalizeWorkspaceFamily(path.match(/^\/workspace\/([^/]+)/)?.[1] || '')
}

export function workspaceFamilyFromRouteContext(
  path: string,
  workspace?: unknown
): WorkspaceFamily | '' {
  return workspaceFamilyFromPath(path) || normalizeWorkspaceFamily(workspace)
}

export function workspaceOperationFromPath(path: string): string {
  const operation = String(path || '').match(
    /^\/workspace\/[^/]+\/([^/]+)/
  )?.[1]
  return ['overview', 'identity', 'team', 'create'].includes(operation || '')
    ? ''
    : String(operation || '')
        .trim()
        .toLowerCase()
}

export function toWorkspaceFamilyPath(family: WorkspaceFamily | string) {
  const normalized =
    normalizeWorkspaceFamily(family) ||
    String(family || '')
      .trim()
      .toLowerCase()
  return `${CONSOLE_ROOT}/${normalized}`
}

export function toWorkspaceFamilyLabel(key: WorkspaceFamily | string) {
  return String(normalizeWorkspaceFamily(key) || key || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

export function toWorkspaceSelectionStateKey(family: WorkspaceFamily | string) {
  return `fireux_runtime_${normalizeWorkspaceFamily(family)}`
}
