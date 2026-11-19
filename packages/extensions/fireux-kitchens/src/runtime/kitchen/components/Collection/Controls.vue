<template>
  <div class="kitchen-collection-controls">
    <div class="kitchen-collection__search">
      <UInput
        v-model="query"
        placeholder="Search Kitchens, places or cuisines"
        aria-label="Search Kitchens, places or cuisines"
        icon="i-lucide-search"
        size="xl"
        class="directory-search"
      />
      <span aria-live="polite" class="kitchen-collection__count">{{
        countLabel
      }}</span>
    </div>

    <div
      v-if="categories.length > 1"
      class="kitchen-collection__filters"
      aria-label="Filter Kitchens by category"
    >
      <UButton
        v-for="filter in categories"
        :key="filter.value"
        :color="category === filter.value ? 'primary' : 'neutral'"
        :variant="category === filter.value ? 'soft' : 'ghost'"
        :aria-pressed="category === filter.value"
        size="sm"
        @click="category = filter.value"
      >
        {{ filter.label }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  countLabel: string
  categories: { value: string; label: string }[]
}>()
const query = defineModel<string>('query', { required: true })
const category = defineModel<string>('category', { required: true })
</script>

<style scoped>
.kitchen-collection-controls {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.kitchen-collection__search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
.kitchen-collection__count {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
.directory-search {
  width: min(100%, 32rem);
}
.kitchen-collection__filters {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
</style>
