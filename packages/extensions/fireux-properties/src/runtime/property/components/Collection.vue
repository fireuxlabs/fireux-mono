<template>
  <section class="entity-collection property-collection">
    <CollectionHeader title="Properties" description="Browse properties available through this app.">
      <template #controls>
        <UInput v-if="properties.length > 15" v-model="query" placeholder="Search properties…" aria-label="Search properties" icon="i-lucide-search" class="entity-collection__search" />
        <span class="entity-collection__count">{{ visibleCount }} properties</span>
      </template>
    </CollectionHeader>
    <PropertyCollectionList :cards="cards" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import type { PropertyDirectoryEntry } from '../models/property-index.model'
const props = defineProps<{
  properties: PropertyDirectoryEntry[]
}>()
const properties = computed(() => props.properties)
const makeCard = (property: PropertyDirectoryEntry) => ({
  id: property.id, to: '', title: property.name,
  subtitle: property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1),
  meta: `${property.unit_count} unit${property.unit_count === 1 ? '' : 's'}`,
  imageUrl: property.image_url || '', status: 'active', badges: [property.property_type], summary: '',
})
const { query, visibleItems, visibleCount } = useCollectionSearch({ items: properties, makeCard, initialVariant: 'cell' })
const cards = computed(() => visibleItems.value.map(makeCard))
</script>
