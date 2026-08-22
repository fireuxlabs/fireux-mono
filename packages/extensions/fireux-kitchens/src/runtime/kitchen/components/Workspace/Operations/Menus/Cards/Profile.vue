<template>
  <UCard v-if="menu">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex min-w-0 items-start gap-3">
        <UAvatar icon="i-lucide-book-open" size="lg" class="shrink-0" />

        <div class="min-w-0 space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ menuName }}
          </h2>

          <p v-if="menuDescription" class="max-w-2xl text-sm text-dimmed">
            {{ menuDescription }}
          </p>

          <div class="flex flex-wrap gap-2">
            <UBadge :color="statusColor" variant="soft">
              {{ menuStatus }}
            </UBadge>
            <UBadge color="neutral" variant="soft">
              {{ sectionLabel }}
            </UBadge>
            <UBadge
              :color="orderingEnabled ? 'success' : 'neutral'"
              variant="soft"
            >
              {{ orderingLabel }}
            </UBadge>
          </div>
        </div>
      </div>

      <UButton
        v-if="menuStatus === 'published'"
        :to="`/menus/${encodeURIComponent(String(menu?.id || ''))}`"
        color="neutral"
        variant="soft"
        icon="i-lucide-external-link"
      >
        View public Menu
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenMenu as Menu } from '../../../../../../menu/utils/kitchen-menu.ts'

const props = withDefaults(
  defineProps<{
    menu?: Menu | null
    sectionsCount?: number
  }>(),
  {
    menu: null,
    sectionsCount: 0,
  }
)

const text = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => text(props.menu?.name) || 'Untitled menu')
const menuDescription = computed(() => text(props.menu?.description))
const menuStatus = computed(() => text(props.menu?.status) || 'draft')
const statusColor = computed(() =>
  menuStatus.value === 'published'
    ? 'success'
    : menuStatus.value === 'archived'
      ? 'neutral'
      : 'warning'
)
const orderingEnabled = computed(
  () =>
    props.menu?.ordering?.enabled === true &&
    Array.isArray(props.menu?.ordering?.order_types) &&
    props.menu.ordering.order_types.length > 0
)
const orderingLabel = computed(() =>
  orderingEnabled.value ? 'Ordering enabled' : 'Browse only'
)
const sectionLabel = computed(
  () => `${props.sectionsCount} section${props.sectionsCount === 1 ? '' : 's'}`
)
</script>
