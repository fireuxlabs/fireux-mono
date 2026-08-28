import { computed } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useNav } from '../../navigation/useNav'
import {
  normalizeWorkspaceFamily,
  workspaceFamilyFromRouteContext,
} from './workspaceRoutes'
import type { NavItem, NavPosition } from '../../navigation/types'

function normalizePath(value: unknown): string {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
}

function isWorkspaceRootPath(path: string) {
  return /^\/workspace\/[^/]+$/.test(path)
}

function isWorkspaceCreatePath(path: string) {
  return /^\/workspace\/[^/]+\/create$/.test(path)
}

export const useWorkspaceNav = () => {
  const nav = useNav(['workspace'])
  const route = useRoute()
  const workspaces = useFireUXConfig()
    .workspaces.map((value) => normalizeWorkspaceFamily(value))
    .filter(Boolean)
  const enabledWorkspaces = new Set(workspaces)
  const currentWorkspace = computed(() =>
    workspaceFamilyFromRouteContext(
      normalizePath(route.path),
      route.meta.workspace
    )
  )
  const baseNavFilter = (item: NavItem) => {
    const path = normalizePath(item.to)
    if (path === '/workspace') return true
    if (!path.startsWith('/workspace/')) return true

    const itemFamily = workspaceFamilyFromRouteContext(path)
    if (!itemFamily) return false
    if (!enabledWorkspaces.has(itemFamily)) return false

    const workspace = currentWorkspace.value
    if (!workspace) {
      return isWorkspaceRootPath(path)
    }

    if (itemFamily !== workspace) return false

    return true
  }

  const resolveItemPosition = (item: NavItem): NavPosition => {
    if (item.position) return item.position

    const path = normalizePath(item.to)
    return isWorkspaceRootPath(path) || isWorkspaceCreatePath(path)
      ? 'bottom'
      : 'middle'
  }

  const canonicalOrder = (item: NavItem) => {
    const path = normalizePath(item.to)
    if (isWorkspaceRootPath(path)) return 0
    if (/\/overview$/.test(path)) return 0
    if (/\/identity$/.test(path)) return 10
    if (/\/team$/.test(path)) return 10_000
    return 100 + item.order
  }
  const items = computed(() =>
    nav.items.value
      .filter((item) => baseNavFilter(item))
      .sort((left, right) => canonicalOrder(left) - canonicalOrder(right))
  )
  const desktop = computed(() => items.value.filter((item) => item.desktop))

  return {
    currentWorkspace,
    resolveItemPosition,
    items,
    desktop,
  }
}
