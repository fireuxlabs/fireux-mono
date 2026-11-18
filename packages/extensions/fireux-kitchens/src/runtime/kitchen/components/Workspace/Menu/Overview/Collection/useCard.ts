import { computed } from 'vue'
import type { Menu } from '../../../../../../menu/models/menu.model'
import { publishedMenuDates } from '../../../../../../menu/utils/calendar/daily'
import { menuWorkspaceDestination } from '../../../../../utils/menu-workspace-destination'

const statuses = {
  published: { label: 'Published', color: 'success' },
  draft: { label: 'Draft', color: 'neutral' },
  archived: { label: 'Archived', color: 'neutral' },
} as const

const formatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

export function useMenuOverviewCard(readMenu: () => Menu) {
  const title = computed(() => {
    const menu = readMenu()
    return menu.internal_name?.trim() || menu.name?.trim() || 'Untitled menu'
  })
  const customerName = computed(() => {
    const name = readMenu().name?.trim()
    return name && name !== title.value ? name : undefined
  })
  const destination = computed(() => menuWorkspaceDestination(readMenu()))
  const specials = computed(
    () => readMenu().schedule === 'daily' && readMenu().purpose === 'specials'
  )
  const kind = computed(() => {
    if (specials.value)
      return { label: 'Daily specials', icon: 'i-lucide-calendar-days' }
    if (readMenu().schedule === 'daily')
      return { label: 'Daily menu', icon: 'i-lucide-calendar-days' }
    if (readMenu().format === 'document')
      return { label: 'Menu document', icon: 'i-lucide-file-text' }
    return { label: 'Menu', icon: 'i-lucide-book-open' }
  })
  const status = computed(() => statuses[readMenu().status] ?? statuses.draft)
  const audience = computed(() => {
    if (readMenu().audience === 'private_link') return 'Private link'
    if (readMenu().audience === 'protected_group') return 'Restricted'
  })
  const releases = computed(() => {
    const menu = readMenu()
    return menu.schedule === 'daily' && menu.status === 'published'
      ? publishedMenuDates(menu.published_dates)
      : []
  })
  const releaseCount = computed(() => releases.value.length)
  const releaseDate = computed(() =>
    releaseCount.value === 1 ? releases.value[0] : undefined
  )
  const releaseLabel = computed(() =>
    releaseDate.value
      ? formatter.format(new Date(releaseDate.value + 'T12:00:00Z'))
      : ''
  )
  return {
    title,
    customerName,
    destination,
    specials,
    kind,
    status,
    audience,
    releaseDate,
    releaseLabel,
    releaseCount,
  }
}
