<template>
  <section class="space-y-5" aria-label="App directory">
    <div class="flex flex-wrap items-center gap-3">
      <UInput
        v-model="query"
        :placeholder="hasMore ? 'Filter loaded apps…' : 'Search apps…'"
        :aria-label="hasMore ? 'Filter loaded apps' : 'Search apps'"
        icon="i-lucide-search"
        class="min-w-0 flex-1 sm:max-w-sm"
      />
      <span class="text-sm text-muted" role="status">{{ countLabel }}</span>
    </div>
    <AppCollectionList v-if="cardsFiltered.length" :cards="cardsFiltered" />
    <div
      v-else
      class="rounded-2xl border border-dashed border-default px-6 py-10 text-center"
      role="status"
    >
      <p class="font-medium text-highlighted">
        {{ hasMore ? 'No matches in loaded apps' : 'No matching apps' }}
      </p>
      <p class="mt-1 text-sm text-muted">
        {{
          hasMore
            ? 'Load more apps below or try another keyword.'
            : 'Try another name or keyword.'
        }}
      </p>
      <UButton
        v-if="query"
        class="mt-4"
        label="Clear search"
        variant="soft"
        color="neutral"
        @click="query = ''"
      />
    </div>
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
  makeCard: (app) => makeCard(app),
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
