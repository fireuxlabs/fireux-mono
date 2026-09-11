<template>
  <section class="menu-discovery" aria-label="Find a menu">
    <div class="menu-discovery__search">
      <UIcon name="i-lucide-search" aria-hidden="true" />
      <input
        v-model="query"
        type="search"
        aria-label="Search menus"
        placeholder="Try pizza, tapas or a venue name"
      />
      <span class="menu-discovery__search-hint">Explore local menus</span>
    </div>
    <div class="menu-discovery__filters">
      <div class="menu-discovery__types" aria-label="Menu type">
        <button
          v-for="option in contentOptions"
          :key="option.value"
          type="button"
          :aria-pressed="content === option.value"
          @click="content = option.value"
        >
          <UIcon :name="option.icon" />{{ option.label }}
        </button>
      </div>
      <label class="menu-discovery__service">
        <UIcon name="i-lucide-sliders-horizontal" aria-hidden="true" />
        <select v-model="service" aria-label="Service">
          <option value="all">Any service</option>
          <option value="delivery">Delivery</option>
          <option value="collection">Collection</option>
          <option value="pre_order">Pre-order</option>
        </select>
      </label>
    </div>
    <div class="menu-discovery__results-heading">
      <div>
        <p class="menu-discovery__eyebrow">Find your next favourite</p>
        <h2>{{ filtered ? 'Your matches' : 'Explore the menus' }}</h2>
      </div>
      <span aria-live="polite">{{
        pending
          ? 'Loading menus…'
          : `${visible.length} ${hasMore ? 'loaded ' : ''}menu${visible.length === 1 ? '' : 's'}`
      }}</span>
    </div>
    <div v-if="pending" class="menu-discovery__state" role="status">
      Finding menus…
    </div>
    <div v-else-if="unavailable" class="menu-discovery__state" role="alert">
      <UIcon name="i-lucide-wifi-off" />
      <h3>Menus couldn’t load</h3>
      <p>Please try again in a moment.</p>
      <MoleculesCopyError
        message="Menus couldn’t load. Please try again in a moment."
      />
      <UButton color="neutral" variant="outline" @click="$emit('retry')"
        >Try again</UButton
      >
    </div>
    <template v-else>
      <MenuCollectionList v-if="visible.length" :menus="visible" />
      <div v-else class="menu-discovery__state">
        <UIcon name="i-lucide-search" />
        <h3>
          {{ filtered ? 'No menus match yet' : 'Something good is on its way' }}
        </h3>
        <p>
          {{
            filtered
              ? 'Try another word or broaden your filters.'
              : 'Published menus will appear here.'
          }}
        </p>
        <UButton
          v-if="filtered"
          color="neutral"
          variant="outline"
          @click="reset"
          >Clear filters</UButton
        >
      </div>
      <p v-if="hasMore" class="menu-discovery__note">
        Filters apply to the menus loaded so far. Load more to keep exploring.
      </p>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuDirectoryEntry } from '../models/menu-directory.response'
import {
  filterPublicMenus,
  type MenuDiscoveryFilters,
} from '../utils/menu-discovery'
const props = defineProps<{
  menus: MenuDirectoryEntry[]
  pending?: boolean
  unavailable?: boolean
  hasMore?: boolean
}>()
defineEmits<{ retry: [] }>()
const query = ref('')
const content = ref<MenuDiscoveryFilters['content']>('all')
const service = ref<MenuDiscoveryFilters['service']>('all')
const contentOptions = [
  { value: 'all', label: 'Everything', icon: 'i-lucide-sparkles' },
  { value: 'food', label: 'Food', icon: 'i-lucide-utensils' },
  { value: 'drinks', label: 'Drinks', icon: 'i-lucide-wine' },
] as const
const filtered = computed(() =>
  Boolean(
    query.value.trim() || content.value !== 'all' || service.value !== 'all'
  )
)
const visible = computed(() =>
  filterPublicMenus(props.menus, {
    query: query.value,
    content: content.value,
    service: service.value,
  })
)
function reset() {
  query.value = ''
  content.value = 'all'
  service.value = 'all'
}
</script>
<style scoped>
.menu-discovery {
  display: grid;
  gap: 1.5rem;
}
.menu-discovery__search {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: 1rem;
  background: var(--ui-bg);
  box-shadow: 0 6px 24px #00000005;
}
.menu-discovery__search > :first-child {
  font-size: 1.4rem;
  color: var(--ui-primary);
  flex-shrink: 0;
}
.menu-discovery__search input {
  background: transparent;
  border: 0;
  outline: 0;
  width: 100%;
  min-width: 0;
  font-size: 1rem;
  color: var(--ui-text-highlighted);
}
.menu-discovery__search:focus-within {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
.menu-discovery__search-hint {
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.menu-discovery__filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.menu-discovery__types {
  display: flex;
  gap: 0.5rem;
}
.menu-discovery__types button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--ui-border);
  border-radius: 2rem;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--ui-bg);
}
.menu-discovery__types button[aria-pressed='true'] {
  background: var(--ui-text-highlighted);
  color: var(--ui-bg);
  border-color: var(--ui-text-highlighted);
}
.menu-discovery__service {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}
.menu-discovery__service select {
  background: var(--ui-bg);
  color: var(--ui-text);
  padding: 0.65rem 0.5rem;
  border-radius: 0.5rem;
}
.menu-discovery__results-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}
.menu-discovery__eyebrow {
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 0.4rem;
}
h2 {
  font-size: 1.65rem;
  letter-spacing: -0.035em;
  font-weight: 650;
  color: var(--ui-text-highlighted);
  margin: 0;
}
.menu-discovery__results-heading > span,
.menu-discovery__note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.menu-discovery__state {
  text-align: center;
  padding: 4rem 1rem;
  border: 1px dashed var(--ui-border);
  border-radius: 1rem;
  color: var(--ui-text-muted);
}
.menu-discovery__state > :first-child {
  font-size: 1.75rem;
}
.menu-discovery__state h3 {
  color: var(--ui-text-highlighted);
  font-size: 1.2rem;
  margin: 1rem 0 0.5rem;
}
.menu-discovery__state p {
  margin-bottom: 1rem;
}
button:focus-visible,
select:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
@media (max-width: 640px) {
  .menu-discovery__search-hint {
    display: none;
  }
  .menu-discovery__types button {
    padding: 0.6rem 0.8rem;
  }
}
</style>
