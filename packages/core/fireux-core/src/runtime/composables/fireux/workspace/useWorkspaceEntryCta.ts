import { computed } from 'vue'
import { useRouter } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import {
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

export function useWorkspaceEntryCta(family?: WorkspaceFamily) {
  const fireux = useFireUXConfig()
  const router = useRouter()
  const workspaces = computed<WorkspaceEntryFamily[]>(() =>
    Array.from(
      new Set(
        fireux.workspaces
          .map((value) => normalizeWorkspaceFamily(value))
          .filter(Boolean)
      )
    ).map((key) => ({
      key,
      path:
        fireux.role === 'tenant'
          ? toWorkspaceFamilyPath(key)
          : router
              .getRoutes()
              .find(
                (route) =>
                  (route.meta.nav as { key?: string } | undefined)?.key ===
                  `workspace-${key}`
              )?.path || '/',
    }))
  )

  const hasWorkspaceEntry = computed(() => workspaces.value.length > 0)
  const workspaceEntryPath = computed(
    () =>
      (family
        ? workspaces.value.find(
            (entry) => entry.key === normalizeWorkspaceFamily(family)
          )
        : workspaces.value[0]
      )?.path || '/'
  )
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
    workspaceRootPath: '/',
  }
}
