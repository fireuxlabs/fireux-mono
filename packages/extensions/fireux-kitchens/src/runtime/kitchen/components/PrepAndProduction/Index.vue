<template>
  <section class="prep-overview">
    <WorkspacePageHeader
      title="Prep & Production"
      description="Manage preparations, recipes, ingredients and production."
    />
    <nav class="prep-overview__shortcuts" aria-label="Prep tools">
      <FireActionSurface
        v-for="tool in tools"
        :key="tool.label"
        :to="tool.to"
        class="prep-overview__shortcut"
      >
        <UIcon :name="tool.icon" />
        <span>{{ tool.label }}</span>
        <span v-if="tool.count !== undefined" class="prep-overview__count">{{
          tool.count
        }}</span>
      </FireActionSurface>
    </nav>

    <section class="prep-overview__library" aria-label="Quick access">
      <div class="prep-overview__toolbar">
        <div class="prep-overview__switch" aria-label="Library" role="group">
          <UButton
            v-for="option in views"
            :key="option.value"
            :label="option.label"
            :variant="view === option.value ? 'soft' : 'ghost'"
            :aria-pressed="view === option.value"
            color="neutral"
            @click="view = option.value"
          />
        </div>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="`Find a ${view === 'preparations' ? 'preparation' : 'recipe'}`"
          :aria-label="`Search ${view}`"
          class="prep-overview__search"
        />
      </div>
      <FireState
        v-if="outcome === 'pending' || outcome === 'error'"
        :outcome="outcome"
        :entity="view"
        :error="error"
      />
      <p v-else-if="outcome === 'idle'" class="prep-overview__empty">
        Select a Kitchen to see its library.
      </p>
      <template v-else>
        <div class="prep-overview__rows">
          <FireActionSurface
            v-for="row in visibleRows"
            :key="row.id"
            :to="`${basePath}/${view}/${encodeURIComponent(row.id)}`"
            class="prep-overview__row"
          >
            <UIcon
              :name="
                view === 'preparations'
                  ? 'i-lucide-cooking-pot'
                  : 'i-lucide-book-open'
              "
            />
            <span class="prep-overview__name">{{ row.name }}</span>
            <span v-if="row.detail" class="prep-overview__detail">{{
              row.detail
            }}</span>
            <UIcon
              name="i-lucide-chevron-right"
              class="prep-overview__chevron"
            />
          </FireActionSurface>
        </div>
        <p v-if="!filteredRows.length" class="prep-overview__empty">
          {{
            search.trim() ? 'No matches. Try another name.' : `No ${view} yet.`
          }}
        </p>
        <div class="prep-overview__footer">
          <span class="fx-type-caption"
            >{{
              filteredRows.length > visibleRows.length
                ? `${visibleRows.length} of ${filteredRows.length}`
                : filteredRows.length
            }}
            {{ view }}</span
          >
          <UButton
            v-if="filteredRows.length > limit"
            label="Show more"
            color="neutral"
            variant="ghost"
            @click="limit += 8"
          />
          <UButton
            :to="`${basePath}/${view}`"
            :label="`All ${view}`"
            color="neutral"
            variant="link"
          />
        </div>
      </template>
    </section>

    <section class="prep-overview__production" aria-label="Production tools">
      <span class="fx-type-caption">Production</span>
      <UButton
        :to="`${basePath}/plan`"
        label="Prep plan"
        icon="i-lucide-clipboard-list"
        color="neutral"
        variant="ghost"
      />
      <UButton
        :to="`${basePath}/batches`"
        label="Batches"
        icon="i-lucide-layers"
        color="neutral"
        variant="ghost"
      />
      <UBadge color="neutral" variant="subtle" size="sm"
        >Not connected yet</UBadge
      >
    </section>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenPreparationsRead } from '../../preparation/composables/useKitchenPreparationsRead'
import { useKitchenRecipesRead } from '../../recipe/composables/useKitchenRecipesRead'

const basePath = '/workspace/kitchen/prep'
const workspace = useKitchenWorkspace()
const kitchenId = computed(() =>
  workspace.outcome.value === 'ready' ? workspace.id.value : ''
)
const preparations = useKitchenPreparationsRead(kitchenId)
const recipes = useKitchenRecipesRead(kitchenId)
const view = ref<'preparations' | 'recipes'>('preparations')
const search = ref('')
const limit = ref(8)
const views = [
  { value: 'preparations' as const, label: 'Preparations' },
  { value: 'recipes' as const, label: 'Recipes' },
]
const settledCount = (state: string, count: number) =>
  state === 'ready' || state === 'empty' ? count : undefined
const tools = computed(() => [
  {
    label: 'Preparations',
    icon: 'i-lucide-cooking-pot',
    to: `${basePath}/preparations`,
    count: settledCount(
      preparations.outcome.value,
      preparations.preparations.value.length
    ),
  },
  {
    label: 'Recipes',
    icon: 'i-lucide-book-open',
    to: `${basePath}/recipes`,
    count: settledCount(recipes.outcome.value, recipes.recipes.value.length),
  },
  {
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    to: `${basePath}/ingredients`,
  },
  {
    label: 'Stations',
    icon: 'i-lucide-panels-top-left',
    to: '/workspace/kitchen/stations',
  },
])
const active = computed(() =>
  view.value === 'preparations' ? preparations : recipes
)
const outcome = computed(() =>
  workspace.outcome.value === 'ready'
    ? active.value.outcome.value
    : workspace.outcome.value
)
const error = computed(() => active.value.error.value)
const rows = computed(() =>
  view.value === 'preparations'
    ? preparations.preparations.value.map((row) => ({ ...row, detail: '' }))
    : recipes.recipes.value.map((row) => ({
        ...row,
        detail: row.yield ? `${row.yield.quantity} ${row.yield.unit}` : '',
      }))
)
const filteredRows = computed(() =>
  rows.value
    .filter((row) =>
      row.name
        .toLocaleLowerCase()
        .includes(search.value.trim().toLocaleLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))
)
const visibleRows = computed(() => filteredRows.value.slice(0, limit.value))
watch([view, search], () => {
  limit.value = 8
})
watch(kitchenId, () => {
  search.value = ''
  limit.value = 8
})
</script>
<style scoped>
.prep-overview {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.prep-overview__shortcuts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
}
.prep-overview__shortcut {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-elevated);
  font-weight: 600;
}
.prep-overview__count {
  margin-inline-start: auto;
  color: var(--ui-text-muted);
  font-variant-numeric: tabular-nums;
}
.prep-overview__library {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  overflow: hidden;
}
.prep-overview__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
  border-bottom: 1px solid var(--ui-border);
}
.prep-overview__switch {
  display: flex;
  gap: var(--spacing);
}
.prep-overview__search {
  flex: 0 1 20rem;
}
.prep-overview__rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.prep-overview__row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
  min-width: 0;
}
.prep-overview__name {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 500;
}
.prep-overview__detail {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  white-space: nowrap;
}
.prep-overview__chevron {
  color: var(--ui-text-dimmed);
  flex-shrink: 0;
}
.prep-overview__row:hover,
.prep-overview__shortcut:hover {
  background: var(--ui-bg-accented);
}
.prep-overview__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 3);
}
.prep-overview__empty {
  padding: calc(var(--spacing) * 4);
  color: var(--ui-text-muted);
}
.prep-overview__production {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
@media (max-width: 640px) {
  .prep-overview__shortcuts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .prep-overview__rows {
    grid-template-columns: 1fr;
  }
  .prep-overview__search {
    flex: 1 1 100%;
  }
}
</style>
