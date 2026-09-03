<template>
  <section class="entity-collection menu-collection">
    <CollectionHeader
      title="Public menus"
      description="Every result is a stable public Menu: either connected to a Kitchen or published as a standalone document."
    >
      <template #controls>
        <UInput v-if="menus.length > 15" v-model="query" placeholder="Search menus…" aria-label="Search menus" icon="i-lucide-search" class="entity-collection__search" />
        <span class="entity-collection__count">{{ visibleCount }} menus</span>
      </template>
    </CollectionHeader>
    <MenuCollectionList :menus="visibleItems" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import type { MenuDirectoryEntry } from '../models/menu-collection.model'
const props = defineProps<{
  menus: MenuDirectoryEntry[]
}>()
const menus = computed(() => props.menus)
const makeCard = (menu: MenuDirectoryEntry) => ({ title: menu.name, subtitle: menu.kitchen?.name || menu.description || '' })
const { query, visibleItems, visibleCount } = useCollectionSearch({ items: menus, makeCard, initialVariant: 'cell' })
</script>
