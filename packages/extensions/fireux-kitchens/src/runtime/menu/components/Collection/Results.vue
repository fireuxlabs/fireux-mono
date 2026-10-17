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
      <article v-for="group in groups" :key="group.id" class="menu-discovery-entry">
        <p v-if="group.venue" class="text-sm text-muted">{{ group.venue }}</p>
        <NuxtLink :to="group.to" class="group flex items-start justify-between gap-4">
          <h2 class="text-2xl font-semibold tracking-tight group-hover:text-primary">{{ group.menus.map(menu => menu.name).join(' · ') }}</h2>
          <UIcon name="i-lucide-arrow-up-right" class="mt-1 size-5 shrink-0" aria-hidden="true" />
        </NuxtLink>
        <p v-for="description in group.descriptions" :key="description" class="text-sm leading-relaxed text-muted">{{ description }}</p>
        <ul v-if="group.matchingDishes.length" class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-highlighted" aria-label="Matching food">
          <li v-for="dish in group.matchingDishes" :key="dish.id">{{ dish.name }}</li>
        </ul>
        <KitchenDetailOfferingTimes :offerings="group.offerings" compact />
        <div class="flex flex-wrap gap-2">
          <UButton v-for="action in group.actions" :key="action.to" :to="action.to" color="primary" variant="soft">
            {{ action.label }}
          </UButton>
        </div>
        <NuxtLink :to="group.browseTo" class="self-start text-sm text-muted hover:text-primary">
          Other menus at {{ group.venue || 'this venue' }}
        </NuxtLink>
      </article>
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
        to: menuRouteIndexPath(scope, choice.value || undefined),
      }))
    return {
      id,
      menus: entries,
      matchingDishes: [...new Map(entries.flatMap(menu => menu.matching_dishes || []).map(dish => [dish.id, dish])).values()],
      venue: first.source?.kitchen_name || first.kitchen?.name,
      descriptions: [...new Set(entries.map(menu => menu.description).filter(Boolean))],
      offerings: [...new Map(entries.flatMap(servingTimes).map(offering => [offering.id, offering])).values()],
      actions,
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
.menu-discovery-entry { display: flex; flex-direction: column; gap: .85rem; border-top: 1px solid var(--ui-border); padding-block: 1.5rem; min-width: 0; }
@media (max-width: 640px) { .menu-discovery-grid { grid-template-columns: minmax(0, 1fr); gap: 0; } }
</style>
