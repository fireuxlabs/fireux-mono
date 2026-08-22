// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: pre-create family workspace and selection state for navigation.
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useNav } from '../../navigation/useNav'
import {
  normalizeWorkspaceFamily,
  workspaceFamilyFromRouteContext,
} from './workspaceRoutes'
import { useWorkspace } from './useWorkspace'
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
  const workspaceRoot = useWorkspace()
  const familyNames = workspaceRoot.families
    .map((value) => normalizeWorkspaceFamily(value))
    .filter(Boolean)
  const enabledFamilies = new Set(familyNames)
  const familyWorkspaces = new Map(
    familyNames.map((family) => [family, useWorkspace(family)] as const)
  )
  const activeFamily = computed(
    () =>
      workspaceFamilyFromRouteContext(
        normalizePath(route.path),
        route.query.family
      ) || workspaceRoot.activeFamily.value
  )
  const baseNavFilter = (item: NavItem) => {
    const path = normalizePath(item.to)
    if (path === '/workspace') return true
    if (!path.startsWith('/workspace/')) return true

    const itemFamily = workspaceFamilyFromRouteContext(path)
    if (!itemFamily) return false
    if (!enabledFamilies.has(itemFamily)) return false
    if (
      isWorkspaceCreatePath(path) &&
      !familyWorkspaces.get(itemFamily)?.canCreateTarget()
    ) {
      return false
    }

    const family = activeFamily.value
    if (!family) {
      return isWorkspaceRootPath(path)
    }

    if (itemFamily !== family) return false

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
  const mobile = computed(() => items.value.filter((item) => item.mobile))

  return {
    ...nav,
    baseNavFilter,
    resolveItemPosition,
    items,
    desktop,
    mobile,
  }
}
