import { computed } from 'vue'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import {
  CONSOLE_ROOT,
  type WorkspaceFamily,
  normalizeWorkspaceFamily,
  toWorkspaceFamilyLabel,
  toWorkspaceFamilyPath,
} from './workspaceRoutes'

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
  const fireux = useFireUXConfig()
  const workspaces = computed<WorkspaceEntryFamily[]>(() =>
    Array.from(
      new Set(
        fireux.workspaces
          .map((value) => normalizeWorkspaceFamily(value))
          .filter(Boolean)
      )
    ).map((key) => ({
      key,
      path: toWorkspaceFamilyPath(key),
    }))
  )

  const hasWorkspaceEntry = computed(() => workspaces.value.length > 0)
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
    hasWorkspaceEntry,
    workspaceEntryPath,
    workspaceRootPath: CONSOLE_ROOT,
  }
}
