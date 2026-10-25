import { computed } from 'vue'
import { useRoute } from '#imports'
import { useWorkspaceNav } from './useWorkspaceNav'
import { useWorkspaceEntryCta } from './useWorkspaceEntryCta'
import { toWorkspaceFamilyLabel } from '../utils/routes'
import type { NavItem } from '../../composables/navigation/types'

/** Route metadata describes the page; navigation supplies its named ancestors. */
export function useWorkspacePageNavigation() {
  const route = useRoute()
  const navigation = useWorkspaceNav()
  const { workspaceEntryPath } = useWorkspaceEntryCta()
  const metadata = computed(
    () => route.meta.nav as Partial<NavItem> | undefined
  )
  const entries = computed<Partial<NavItem>[]>(() =>
    navigation.items.value.flatMap((item) => [item, ...(item.children || [])])
  )
  const current = computed(() =>
    entries.value.find(
      (item) =>
        item.to === route.path ||
        (metadata.value?.key && item.key === metadata.value.key)
    )
  )
  const title = computed(
    () =>
      metadata.value?.label ||
      current.value?.label ||
      toWorkspaceFamilyLabel(navigation.currentWorkspace.value) ||
      'Workspace'
  )
  const description = computed(
    () => metadata.value?.description || current.value?.description || ''
  )
  const children = computed(() => current.value?.children || [])
  const breadcrumbs = computed(() => {
    const items: { label: string; to?: string }[] = []
    const seen = new Set<string>([route.path])
    const add = (label: string, to?: string) => {
      if (!to || seen.has(to)) return
      items.push({ label, to })
      seen.add(to)
    }
    add('Home', workspaceEntryPath.value)
    const overview = navigation.items.value.find(
      (item) =>
        item.key ===
        'workspace-' + navigation.currentWorkspace.value + '-overview'
    )
    if (overview) add(overview.label, overview.to)
    for (const item of navigation.items.value) {
      if (
        item.to &&
        item.to !== workspaceEntryPath.value &&
        route.path.startsWith(item.to.replace(/\/$/, '') + '/')
      )
        add(item.label, item.to)
    }
    items.push({ label: title.value })
    return items
  })
  return { title, description, children, breadcrumbs }
}
