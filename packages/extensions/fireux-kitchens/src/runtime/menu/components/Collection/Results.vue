<template>
  <section class="entity-collection menu-collection">
    <div class="menu-collection__search">
      <UInput
        v-model="query"
        placeholder="Search food or venues"
        aria-label="Search food or venues"
        icon="i-lucide-search"
        size="xl"
        class="directory-search"
        maxlength="120"
      />
      <span
        v-if="!hideResults"
        aria-live="polite"
        class="menu-collection__count"
      >
        {{ groups.length }} {{ groups.length === 1 ? 'result' : 'results' }}
      </span>
    </div>
    <nav aria-label="Choose how to eat" class="menu-collection__services">
      <UButton
        v-for="choice in choices"
        :key="choice.label"
        :color="service === choice.value ? 'primary' : 'neutral'"
        :variant="service === choice.value ? 'solid' : 'soft'"
        :aria-pressed="service === choice.value"
        @click="selectService(choice.value)"
        >{{ choice.label }}</UButton
      >
    </nav>
    <template v-if="!hideResults">
      <div v-if="groups.length" class="menu-discovery-grid">
        <MenuCardsFoodVenue
          v-for="group in groups"
          :key="group.id"
          :venue="group"
        />
      </div>
      <UAlert
        v-else
        :title="
          query.trim()
            ? 'No matching menus'
            : 'No menus available for this service'
        "
        :description="
          query.trim()
            ? 'Try another search.'
            : 'Try another service or check back later.'
        "
        color="neutral"
        variant="soft"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import {
  foodVenueGroups,
  foodPortalServices,
  type FoodPortalService,
} from '../../utils/catalogue/venue-groups'

const props = defineProps<{
  menus: MenuDirectoryEntry[]
  hideResults?: boolean
}>()
const emit = defineEmits<{
  (event: 'service-change', service: 'online' | 'collection' | 'delivery'): void
  (event: 'search-change', query: string): void
}>()
const service = ref<FoodPortalService>('')
function selectService(value: FoodPortalService) {
  service.value = value
  emit('service-change', value || 'online')
}
const choices = [
  { label: 'Collection & delivery', value: '' as const },
  ...foodPortalServices,
]
const query = ref('')
watch(query, (value) => emit('search-change', value))
const groups = computed(() => foodVenueGroups(props.menus, service.value))
</script>
<style scoped>
.menu-collection {
  display: grid;
  gap: 1.5rem;
  min-width: 0;
}
.menu-collection__search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
.menu-collection__count {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
.menu-collection__services {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
.directory-search {
  width: min(100%, 32rem);
}
.menu-discovery-grid {
  display: grid;
  gap: 1.5rem 2.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 48rem) {
  .menu-discovery-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
  }
}
</style>
