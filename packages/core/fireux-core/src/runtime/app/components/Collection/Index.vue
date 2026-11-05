<template>
  <section class="app-collection" aria-label="App directory">
    <div class="collection-manager__controls">
      <UInput
        v-model="query"
        :placeholder="hasMore ? 'Filter loaded apps…' : 'Search apps…'"
        :aria-label="hasMore ? 'Filter loaded apps' : 'Search apps'"
        icon="i-lucide-search"
        class="entity-collection__search"
      />
      <span class="entity-collection__count" role="status">{{
        countLabel
      }}</span>
    </div>
    <AppCollectionList v-if="cardsFiltered.length" :cards="cardsFiltered" />
    <UPageCard
      v-else
      :title="hasMore ? 'No matches in loaded apps' : 'No matching apps'"
      :description="
        hasMore
          ? 'Load more apps below or try another keyword.'
          : 'Try another name or keyword.'
      "
      variant="subtle"
      role="status"
    >
      <UButton
        v-if="query"
        label="Clear search"
        variant="soft"
        color="neutral"
        @click="query = ''"
      />
    </UPageCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppView } from '../../composables/useAppView'
import type { App } from '../../models/app.model'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'

const props = defineProps<{ apps: App[]; hasMore?: boolean }>()
const { toCard: makeCard } = useAppView()
const { query, visibleItems, visibleCount } = useCollectionSearch<
  App,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: computed(() => props.apps),
  // App search is discovery copy, not media URLs, internal context or status.
  searchText: (app) =>
    [app.name, app.short_name, app.tagline, app.description, app.ecosystem_id]
      .filter(Boolean)
      .join(' '),
  makeCard,
})
const cardsFiltered = computed(() =>
  visibleItems.value
    .map((app) => makeCard(app))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)
const countLabel = computed(
  () =>
    (query.value
      ? `${visibleCount.value} of ${props.apps.length} apps`
      : `${props.apps.length} app${props.apps.length === 1 ? '' : 's'}`) +
    (props.hasMore ? ' loaded' : '')
)
</script>

<style scoped>
.app-collection {
  display: grid;
  gap: calc(var(--spacing) * 5);
  min-width: 0;
}
</style>
