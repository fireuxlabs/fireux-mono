<template>
  <nav aria-label="Menu workspace" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
    <NuxtLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="group rounded-lg border p-3 transition-colors"
      :class="isActive(item)
        ? 'border-primary bg-primary/10'
        : 'border-default bg-default hover:border-primary/50'"
    >
      <span class="flex items-center justify-between gap-3">
        <span class="flex min-w-0 items-center gap-2">
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          <span class="truncate text-sm font-semibold text-highlighted">
            {{ item.label }}
          </span>
        </span>
        <UBadge
          v-if="item.meta"
          color="neutral"
          variant="soft"
          size="sm"
        >
          {{ item.meta }}
        </UBadge>
      </span>
      <span class="mt-1 block text-xs leading-5 text-dimmed">
        {{ item.description }}
      </span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useKitchenConsoleMenuOrdering } from '../../../../composables/console/operations/Menus/useKitchenConsoleMenuOrdering'

type WorkspaceItem = {
  key: string
  label: string
  description: string
  icon: string
  meta?: string
  to: string
}

const route = useRoute()
const {
  menu,
  menuId,
  orderingEnabled,
  sections,
  source,
} = useKitchenConsoleMenuOrdering()
const basePath = computed(() =>
  `/console/kitchen/menus/${encodeURIComponent(menuId.value)}`
)
const items = computed<WorkspaceItem[]>(() => [
  {
    key: 'overview',
    label: 'Overview',
    description: 'Identity and guest-facing details.',
    icon: 'i-lucide-layout-dashboard',
    to: basePath.value,
  },
  {
    key: 'content',
    label: 'Content',
    description: 'Sections and menu items.',
    icon: 'i-lucide-list-tree',
    meta: String(sections.value.length),
    to: `${basePath.value}/content`,
  },
  {
    key: 'ordering',
    label: 'Ordering',
    description: 'Customer ordering surfaces.',
    icon: 'i-lucide-shopping-bag',
    meta: orderingEnabled.value ? 'On' : 'Off',
    to: `${basePath.value}/ordering`,
  },
  {
    key: 'publishing',
    label: 'Publishing',
    description: 'Visibility and public doorway.',
    icon: 'i-lucide-send',
    meta: menu.value?.status === 'published' ? 'Live' : 'Draft',
    to: `${basePath.value}/publishing`,
  },
  {
    key: 'source',
    label: 'Source',
    description: 'Original files and processing.',
    icon: 'i-lucide-file-scan',
    meta: source.value ? 'Attached' : undefined,
    to: `${basePath.value}/source`,
  },
])

function isActive(item: WorkspaceItem) {
  if (item.key === 'overview') return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>
