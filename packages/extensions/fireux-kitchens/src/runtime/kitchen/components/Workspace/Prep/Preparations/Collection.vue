<template>
  <WorkspaceKitchenCollectionToolbar
    v-model="query"
    label="preparations"
    singular="preparation"
    :count="visible.length"
  />
  <ul v-if="visible.length" class="preparations-list" aria-label="Preparations">
    <FireCollectionRow v-for="record in visible" :key="record.id" as="li">
      <NuxtLink :to="preparationTo(record.id)" class="preparation-link">
        <UIcon name="i-lucide-cooking-pot" aria-hidden="true" />
        <div>
          <h2 class="fx-type-card-heading">{{ record.name }}</h2>
          <p v-if="record.description" class="fx-type-caption">
            {{ record.description }}
          </p>
        </div>
      </NuxtLink>
      <template #value>
        <UBadge color="neutral" variant="subtle">
          {{ record.recipeCount }}
          {{ record.recipeCount === 1 ? 'recipe' : 'recipes' }}
        </UBadge>
      </template>
    </FireCollectionRow>
  </ul>
  <p v-else role="status">
    {{ query.trim() ? 'No matching preparations.' : 'No preparations yet.' }}
  </p>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Preparation } from '../../../../records/prep/preparations/preparation'

const props = defineProps<{
  preparations: Preparation[]
  preparationTo: (id: string) => string
  recipeCount: (id: string) => number
}>()

const query = ref('')
const visible = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return props.preparations
    .filter((record) =>
      `${record.name} ${record.description || ''}`
        .toLocaleLowerCase()
        .includes(search)
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((record) => ({ ...record, recipeCount: props.recipeCount(record.id) }))
})
</script>

<style scoped>
.preparations-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.preparations-list > li + li {
  border-block-start: 1px solid var(--ui-border);
}
.preparation-link {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 3);
  padding-block: calc(var(--spacing) * 4);
  overflow-wrap: anywhere;
}
.preparation-link h2,
.preparation-link p {
  margin: 0;
}
.preparation-link:hover h2 {
  text-decoration: underline;
}
.preparation-link > :first-child {
  flex: none;
  color: var(--ui-text-muted);
}
</style>
