<template>
  <section class="entity-collection menu-collection">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <UInput
        v-model="query"
        placeholder="Search food or venues"
        aria-label="Search food or venues"
        icon="i-lucide-search"
        size="xl"
        class="directory-search"
        maxlength="120"
      />
      <span v-if="!hideResults" class="text-sm text-muted" aria-live="polite">
        {{ groups.length }} {{ groups.length === 1 ? 'result' : 'results' }}
      </span>
    </div>
    <nav class="flex flex-wrap gap-2" aria-label="Choose how to eat">
      <UButton
        v-for="choice in choices"
        :key="choice.label"
        :color="service === choice.value ? 'primary' : 'neutral'"
        :variant="service === choice.value ? 'solid' : 'soft'"
        :aria-pressed="service === choice.value"
        @click="service = choice.value; emit('service-change', choice.value || 'online')"
      >{{ choice.label }}</UButton>
    </nav>
    <template v-if="!hideResults">
    <div v-if="visibleItems.length" class="menu-discovery-grid">
      <FoodVenueCard v-for="group in groups" :key="group.id" :venue="group" />
    </div>
    <UAlert
      v-else
      :title="query.trim() ? 'No matching menus' : 'No menus available for this service'"
      :description="query.trim() ? 'Try another search.' : 'Try another service or check back later.'"
      color="neutral"
      variant="soft"
    />
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FoodVenueCard from '../Cards/FoodVenue.vue'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import { directoryMenuRouteScope, menuRouteIndexPath } from '../../utils/menu-route'

const props = defineProps<{ menus: MenuDirectoryEntry[]; hideResults?: boolean }>()
const emit = defineEmits<{ (event: 'service-change', service: 'online' | 'collection' | 'delivery'): void; (event: 'search-change', query: string): void }>()
const service = ref<'' | 'collection' | 'delivery'>('')
const choices = [
  { label: 'Collection & delivery', value: '' as const },
  { label: 'Collection', value: 'collection' as const },
  { label: 'Delivery', value: 'delivery' as const },
]
const menus = computed(() => props.menus.filter(menu =>
  menu.source?.kitchen_slug && menu.offering_options?.some(option =>
    ['collection', 'delivery'].includes(option.type) &&
    (!service.value || option.type === service.value) && !option.paused
  )
))
const query = ref('')
watch(query, value => emit('search-change', value))
const visibleItems = menus
const servingTimes = (menu: MenuDirectoryEntry) => (menu.offerings || []).filter(offering =>
  !offering.paused && menu.offering_options?.some(option =>
    option.kitchen_offering_id === offering.id && !option.paused &&
    ['collection', 'delivery'].includes(option.type) &&
    (!service.value || option.type === service.value)
  )
)

const groups = computed(() => {
  const grouped = new Map<string, MenuDirectoryEntry[]>()
  for (const menu of visibleItems.value) {
    const key = menu.source?.kitchen_id || menu.source?.kitchen_slug || menu.id
    const entries = grouped.get(key) || []
    entries.push(menu)
    grouped.set(key, entries)
  }
  return [...grouped].map(([id, entries]) => {
    const first = entries[0]!
    const scope = directoryMenuRouteScope(first.source!.kitchen_slug!)
    const actions = choices
      .filter(choice => choice.value &&
        (!service.value || choice.value === service.value) &&
        entries.some(menu => menu.offering_options?.some(option =>
          option.type === choice.value && !option.paused)))
      .map(choice => ({
        label: choice.label,
        icon: choice.value === 'collection' ? 'i-lucide-shopping-bag' : 'i-lucide-truck',
        to: menuRouteIndexPath(scope, choice.value || undefined),
        offerings: [...new Map(entries.flatMap(menu =>
          (menu.offerings || []).filter(offering => !offering.paused &&
            menu.offering_options?.some(option => option.kitchen_offering_id === offering.id &&
              option.type === choice.value && !option.paused))
        ).map(offering => [offering.id, offering])).values()],
      }))
    return {
      id,
      menus: entries,
      matchingDishes: [...new Map(entries.flatMap(menu => menu.matching_dishes || []).map(dish => [dish.id, dish])).values()],
      name: first.source?.kitchen_name || first.kitchen?.name || '',
      logo: first.kitchen?.logo_image_url,
      title: entries.map(menu => menu.name).join(' & '),
      descriptions: [...new Set(entries.map(menu => menu.description).filter(Boolean))],
      offerings: [...new Map(entries.flatMap(servingTimes).map(offering => [offering.id, offering])).values()],
      actions,
      otherOfferings: [...new Map(entries.flatMap(menu => menu.other_offerings || []).map(offering => [offering.id, {
        ...offering,
        to: `${menuRouteIndexPath(scope)}?offering=${encodeURIComponent(offering.id)}`,
      }])).values()],
      browseTo: menuRouteIndexPath(scope),
      to: actions[0]?.to || menuRouteIndexPath(scope),
    }
  })
})
</script>
<style scoped>
.menu-collection { gap: 1.5rem; }
.directory-search { width: min(100%, 32rem); }
.menu-discovery-grid { display: grid; gap: 1.5rem 2.5rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (max-width: 640px) { .menu-discovery-grid { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; } }
</style>
