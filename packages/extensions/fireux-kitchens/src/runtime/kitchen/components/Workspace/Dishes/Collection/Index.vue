<template>
  <section :aria-label="catalogue.title" class="dish-catalogue">
    <WorkspaceKitchenCollectionHeader
      title="Food &amp; drinks"
      :kitchen-name="focus.name"
    >
      <template #actions>
        <UButton
          label="Kitchen AI"
          icon="i-lucide-sparkles"
          color="neutral"
          variant="soft"
          @click="aiOpen = true"
        />
        <UButton
          v-if="!readOnly && (outcome === 'ready' || outcome === 'empty')"
          :label="`Add ${catalogue.singular}`"
          icon="i-lucide-plus"
          :to="catalogue.createPath"
        />
      </template>
    </WorkspaceKitchenCollectionHeader>

    <nav class="catalogue-tabs" aria-label="Food and drink catalogue">
      <NuxtLink
        to="/workspace/kitchen/food/dishes"
        :aria-current="catalogue.itemKind === 'food' ? 'page' : undefined"
        :class="{ selected: catalogue.itemKind === 'food' }"
        ><UIcon name="i-lucide-cooking-pot" /> Dishes</NuxtLink
      >
      <NuxtLink
        to="/workspace/kitchen/food/drinks"
        :aria-current="catalogue.itemKind === 'drink' ? 'page' : undefined"
        :class="{ selected: catalogue.itemKind === 'drink' }"
        ><UIcon name="i-lucide-glass-water" /> Drinks</NuxtLink
      >
    </nav>

    <WorkspaceKitchenCollectionToolbar
      v-if="outcome === 'ready' || outcome === 'empty'"
      v-model="query"
      :label="catalogue.plural"
      :singular="catalogue.singular"
      :count="visibleDishes.length"
    >
      <template #controls>
        <div class="catalogue-views" role="group" aria-label="Catalogue view">
          <UButton
            icon="i-lucide-layout-grid"
            aria-label="Grid view"
            :aria-pressed="view === 'grid'"
            color="neutral"
            :variant="view === 'grid' ? 'soft' : 'ghost'"
            @click="view = 'grid'"
          />
          <UButton
            icon="i-lucide-list"
            aria-label="List view"
            :aria-pressed="view === 'list'"
            color="neutral"
            :variant="view === 'list' ? 'soft' : 'ghost'"
            @click="view = 'list'"
          />
        </div>
      </template>
    </WorkspaceKitchenCollectionToolbar>
    <div
      v-if="
        catalogue.itemKind === 'food' &&
        (outcome === 'ready' || outcome === 'empty')
      "
      class="catalogue-filters"
      role="group"
      aria-label="Dish categories"
    >
      <button
        v-for="item in categoryFilters"
        :key="item.value"
        :aria-pressed="category === item.value"
        :class="{ selected: category === item.value }"
        @click="category = item.value"
      >
        {{ item.label }} <span>{{ item.count }}</span>
      </button>
      <UButton
        v-if="!readOnly && (outcome === 'ready' || outcome === 'empty')"
        label="Organise categories"
        icon="i-lucide-tags"
        variant="ghost"
        color="neutral"
        @click="organise = true"
      />
    </div>
    <div
      v-if="outcome === 'ready' || outcome === 'empty'"
      class="catalogue-filters"
      role="group"
      aria-label="Filter catalogue"
    >
      <button
        v-for="item in filters"
        :key="item.value"
        type="button"
        :aria-pressed="filter === item.value"
        :class="{ selected: filter === item.value }"
        @click="filter = item.value"
      >
        {{ item.label }} <span>{{ item.count }}</span>
      </button>
    </div>

    <MoleculesStateCard
      v-if="error"
      state="error"
      :title="`${catalogue.title} unavailable`"
      :description="String(error)"
    />
    <div
      v-else-if="pending"
      class="dish-grid"
      aria-label="Loading catalogue"
      aria-busy="true"
    >
      <USkeleton v-for="n in 8" :key="n" class="h-64 rounded-xl" />
    </div>
    <div v-else-if="!visibleDishes.length" class="catalogue-empty">
      <UIcon :name="catalogue.icon" class="size-8 text-muted" />
      <h2>{{ dishes.length ? 'No matches' : `No ${catalogue.plural} yet` }}</h2>
      <UButton
        v-if="dishes.length"
        label="Clear filters"
        color="neutral"
        variant="soft"
        @click="clearFilters"
      />
      <UButton
        v-else-if="!readOnly && (outcome === 'ready' || outcome === 'empty')"
        :label="`Add ${catalogue.singular}`"
        :to="catalogue.createPath"
        icon="i-lucide-plus"
      />
    </div>
    <div v-else :class="view === 'grid' ? 'dish-grid' : 'dish-list'">
      <WorkspaceKitchenDishesCardsCell
        v-for="dish in pageDishes"
        :id="dish.id"
        :key="dish.id"
        :title="dish.name || dish.id"
        :image-url="dish.image"
        :description="dish.description"
        :meta="
          [
            catalogue.itemKind === 'food'
              ? dishCategoryLabel(dish.category)
              : '',
            dish.spec ? 'Spec added' : '',
            dish.is_deal ? 'Deal' : '',
          ]
            .filter(Boolean)
            .join(' · ')
        "
        :list="view === 'list'"
        expanded
        link
        :to="dishLink(dish.id)"
      />
    </div>

    <UPagination
      v-if="!pending && !error && visibleDishes.length > pageSize"
      v-model:page="page"
      :total="visibleDishes.length"
      :items-per-page="pageSize"
      :sibling-count="1"
      class="justify-center"
    />

    <UModal
      v-model:open="organise"
      title="Organise categories"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body><WorkspaceKitchenDishesCategories /></template>
    </UModal>
    <USlideover
      v-model:open="aiOpen"
      title="Kitchen AI"
      :description="catalogue.title"
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body
        ><WorkspaceKitchenAICapability
          :capability="catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'"
          :suggestions="suggestions"
          :action-targets="actionTargets"
      /></template>
    </USlideover>
    <DiagnosticsDebugPanel
      object-origin="fetched"
      launcher
      include-route
      :title="`Kitchen ${catalogue.plural}`"
      :objects="{ dishes }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { dishCategories, dishCategoryLabel } from '../../../../models/dish.model'
import { computed, ref, watch } from 'vue'
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import {
  buildMissingDishImageSuggestions,
  buildMissingDrinkImageSuggestions,
} from '../../../../models/capability-suggestions'
const {
  dishes,
  pending,
  error,
  outcome,
  readOnly,
  debug,
  focus,
  kitchenId,
  catalogue,
} = useKitchenDishesContext()
const route = useRoute()
const query = ref(
  typeof route.query.search === 'string' ? route.query.search : ''
)
const category = ref(
  typeof route.query.category === 'string' ? route.query.category : 'all'
)
const organise = ref(false)
const categoryFilters = computed(() =>
  [
    { value: 'all', label: 'All dishes', count: dishes.value.length },
    ...dishCategories.map((item) => ({
      ...item,
      count: dishes.value.filter((dish) => dish.category === item.value).length,
    })),
    {
      value: 'uncategorised',
      label: 'Uncategorised',
      count: dishes.value.filter((dish) => !dish.category).length,
    },
  ].filter((item) => item.value === 'all' || item.count > 0)
)
const clearFilters = () => {
  query.value = ''
  filter.value = 'all'
  category.value = 'all'
}
const filter = ref(
  typeof route.query.filter === 'string' ? route.query.filter : 'all'
)
const view = ref<'grid' | 'list'>(
  route.query.layout === 'grid' ? 'grid' : 'list'
)
const dishLink = (id: string) =>
  `${catalogue.path}/${encodeURIComponent(id)}?${new URLSearchParams({ category: category.value, search: query.value, filter: filter.value, layout: view.value })}`
const aiOpen = ref(false)
const normalize = (value: unknown) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
const filters = computed(() => [
  { value: 'all', label: 'All', count: dishes.value.length },
  {
    value: 'image',
    label: 'Missing image',
    count: dishes.value.filter((d) => !d.image?.trim()).length,
  },
  {
    value: 'description',
    label: 'Missing description',
    count: dishes.value.filter((d) => !d.description?.trim()).length,
  },
])
const visibleDishes = computed(() =>
  dishes.value
    .filter(
      (dish) =>
        (category.value === 'all' ||
          (category.value === 'uncategorised'
            ? !dish.category
            : dish.category === category.value)) &&
        (!normalize(query.value) ||
          normalize(`${dish.name} ${dish.description || ''}`).includes(
            normalize(query.value)
          )) &&
        (filter.value !== 'image' || !dish.image?.trim()) &&
        (filter.value !== 'description' || !dish.description?.trim())
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
)
const page = ref(1)
const pageSize = 40
const pageDishes = computed(() =>
  visibleDishes.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)
watch([query, category, filter, kitchenId], () => {
  page.value = 1
})
watch(
  () => visibleDishes.value.length,
  (count) => {
    page.value = Math.min(page.value, Math.max(1, Math.ceil(count / pageSize)))
  }
)
watch(kitchenId, (_next, previous) => {
  if (!previous) return
  organise.value = false
  query.value = ''
  filter.value = 'all'
  category.value = 'all'
  aiOpen.value = false
})
const suggestions = computed(() =>
  catalogue.itemKind === 'drink'
    ? buildMissingDrinkImageSuggestions(dishes.value)
    : buildMissingDishImageSuggestions(dishes.value)
)
const actionTargets = computed(() =>
  dishes.value.flatMap((dish) =>
    ['update', 'delete'].map((action) => ({
      actionId: `kitchen.${catalogue.itemKind === 'drink' ? 'drinks' : 'dishes'}.${action}-${catalogue.singular}`,
      targetId: dish.id,
      label: dish.name,
    }))
  )
)
</script>

<style scoped>
.dish-catalogue {
  display: grid;
  min-width: 0;
  gap: 24px;
}
.catalogue-views {
  display: flex;
  align-items: center;
  gap: 8px;
}
.catalogue-tabs {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid var(--ui-border);
}
.catalogue-tabs a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px 14px;
  color: var(--ui-text-muted);
  border-bottom: 2px solid transparent;
  font-weight: 500;
}
.catalogue-tabs a.selected {
  color: var(--ui-primary);
  border-color: var(--ui-primary);
}
.catalogue-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}
.catalogue-filters button {
  display: flex;
  gap: 8px;
  align-items: center;
  border-radius: 8px;
  padding: 7px 10px;
  color: var(--ui-text-muted);
  border: 1px solid var(--ui-border);
}
.catalogue-filters button.selected {
  color: var(--ui-text-highlighted);
  background: var(--ui-bg-elevated);
}
.catalogue-filters button span {
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
.catalogue-count {
  margin-left: auto;
  color: var(--ui-text-muted);
}
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px;
}
.dish-list {
  display: grid;
  gap: 10px;
}
.catalogue-empty {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 64px 20px;
  border: 1px dashed var(--ui-border);
  border-radius: 16px;
}
.catalogue-empty h2 {
  font-size: 18px;
  font-weight: 600;
}
@media (max-width: 640px) {
  .dish-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  h1 {
    font-size: 26px;
  }
  .catalogue-count {
    width: 100%;
    margin-top: 4px;
  }
}
</style>
