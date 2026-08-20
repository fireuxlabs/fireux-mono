import { computed } from 'vue'
import {
  CONSOLE_ROOT,
  type WorkspaceFamily,
  normalizeWorkspaceFamily,
  toWorkspaceFamilyLabel,
  toWorkspaceFamilyPath,
} from './workspaceRoutes'
import { useWorkspace } from './useWorkspace'

type WorkspaceEntryFamily = {
  key: WorkspaceFamily
  path: string
}

export type WorkspaceEntryAction = {
  key: WorkspaceFamily
  label: string
  path: string
  icon: string
}

export function useWorkspaceEntryCta() {
  const workspaceRoot = useWorkspace()
  const workspaces = computed<WorkspaceEntryFamily[]>(() =>
    Array.from(
      new Set(
        workspaceRoot.families
          .map((value) => normalizeWorkspaceFamily(value))
          .filter(Boolean)
      )
    ).map((key) => ({
      key,
      path: toWorkspaceFamilyPath(key),
    }))
  )

  const hasWorkspaces = computed(() => workspaces.value.length > 0)
  const hasWorkspaceEntry = computed(() => hasWorkspaces.value)
  const workspaceEntryPath = computed(() => workspaces.value[0]?.path || '/')
  const workspaceActions = computed<WorkspaceEntryAction[]>(() =>
    workspaces.value.length
      ? workspaces.value.map((entry) => ({
          key: entry.key,
          path: entry.path,
          label: `${toWorkspaceFamilyLabel(entry.key)} Workspace`,
          icon: 'i-lucide-circle-play',
        }))
      : []
  )

  return {
    workspaceActions,
    hasWorkspaces,
    hasWorkspaceEntry,
    workspaceEntryPath,
    workspaceRootPath: CONSOLE_ROOT,
    workspaces,
  }
}
