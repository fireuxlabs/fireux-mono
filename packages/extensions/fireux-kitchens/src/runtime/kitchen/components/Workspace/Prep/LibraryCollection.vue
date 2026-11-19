<template>
  <WorkspaceKitchenCollectionToolbar
    v-if="!externalControls"
    v-model="query"
    :label="labels.plural"
    :singular="labels.singular"
    :count="visible.length"
  />
  <FireState
    v-if="outcome === 'pending' || outcome === 'error'"
    :outcome="outcome"
    :entity="labels.plural"
    :error="error"
  />
  <UAlert
    v-else-if="outcome && outcome !== 'ready' && outcome !== 'empty'"
    title="Select a Kitchen"
    :description="`Choose a Kitchen to view its ${labels.plural}.`"
    color="neutral"
    variant="soft"
  />
  <ul
    v-else-if="visible.length"
    class="prep-catalogue-list"
    :aria-label="labels.plural"
  >
    <FireCollectionRow v-for="record in visible" :key="record.id" as="li">
      <NuxtLink :to="record.to" class="prep-catalogue-link">
        <UIcon :name="icon" aria-hidden="true" />
        <div>
          <h2 class="fx-type-card-heading">{{ record.name }}</h2>
          <p v-if="record.description" class="fx-type-caption">
            {{ record.description }}
          </p>
        </div>
      </NuxtLink>
      <template v-if="record.summary" #value>
        <UBadge color="neutral" variant="subtle">{{ record.summary }}</UBadge>
      </template>
    </FireCollectionRow>
  </ul>
  <p v-else role="status">
    {{
      query.trim()
        ? `No matching ${labels.plural}.`
        : `No ${labels.plural} yet.`
    }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { filterLibraryRows } from './useLibraryCatalogue'
const props = defineProps<{
  labels: { singular: string; plural: string }
  icon: string
  externalControls?: boolean
  outcome?: string
  error?: unknown
  rows: {
    id: string
    name: string
    description?: string
    to: string
    summary?: string
  }[]
}>()

const query = defineModel<string>({ default: '' })
const visible = computed(() =>
  props.externalControls
    ? props.rows
    : filterLibraryRows(props.rows, query.value)
)
</script>

<style scoped>
.prep-catalogue-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.prep-catalogue-list > li + li {
  border-block-start: 1px solid var(--ui-border);
}
.prep-catalogue-link {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 3);
  padding-block: calc(var(--spacing) * 4);
  overflow-wrap: anywhere;
}
.prep-catalogue-link h2,
.prep-catalogue-link p {
  margin: 0;
}
.prep-catalogue-link:hover h2 {
  text-decoration: underline;
}
.prep-catalogue-link > :first-child {
  flex: none;
  color: var(--ui-text-muted);
}
</style>
