import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { navigateTo, useRequestURL } from '#imports'
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
  const requestUrl = useRequestURL()
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

  const homePath = (key: WorkspaceFamily) =>
    workspaces.value.find(
      (entry) => entry.key === normalizeWorkspaceFamily(key)
    )?.path || '/'
  const entryHref = (entry: WorkspaceEntryFamily) => {
    const origin = fireux.workspaceConfig[entry.key]?.origin
    return origin && origin !== requestUrl.origin
      ? new URL(entry.path, origin).href
      : entry.path
  }
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
  const workspaceEntryHref = computed(() => {
    const entry = family
      ? workspaces.value.find(
          (item) => item.key === normalizeWorkspaceFamily(family)
        )
      : workspaces.value[0]
    return entry ? entryHref(entry) : '/'
  })
  const openWorkspace = (query: Record<string, string> = {}) => {
    const destination = new URL(workspaceEntryHref.value, requestUrl.origin)
    for (const [key, value] of Object.entries(query)) {
      destination.searchParams.set(key, value)
    }
    const external = destination.origin !== requestUrl.origin
    return navigateTo(
      external
        ? destination.href
        : `${destination.pathname}${destination.search}${destination.hash}`,
      { external }
    )
  }
  const workspaceActions = computed<WorkspaceEntryAction[]>(() =>
    workspaces.value.length
      ? workspaces.value.map((entry) => ({
          key: entry.key,
          path: entryHref(entry),
          label: `${toWorkspaceFamilyLabel(entry.key)} Workspace`,
          icon: 'i-lucide-circle-play',
        }))
      : []
  )

  return {
    workspaceActions,
    hasWorkspaceEntry,
    workspaceEntryPath,
    workspaceEntryHref,
    homePath,
    openWorkspace,
    workspaceRootPath: '/',
  }
}
