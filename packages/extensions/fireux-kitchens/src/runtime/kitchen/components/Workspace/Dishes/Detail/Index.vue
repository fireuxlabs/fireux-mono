<template>
  <section class="dish-workspace">
    <NuxtLink
      :to="catalogueReturn"
      class="text-sm text-muted inline-flex items-center gap-2"
      ><UIcon name="i-lucide-arrow-left" />{{ catalogue.title }}</NuxtLink
    >
    <NuxtLink v-if="menuReturn" :to="menuReturn" class="text-sm text-primary"
      >← Back to menu selection</NuxtLink
    >
    <UAlert
      v-if="outcome === 'idle' || outcome === 'empty'"
      color="neutral"
      title="Select a kitchen"
      description="Choose a Kitchen before viewing its food and drinks."
    />
    <MoleculesStateCard
      v-else-if="error"
      state="error"
      :title="`${catalogue.singular} unavailable`"
      description="This record could not be loaded. Please try again."
    />
    <p v-else-if="pending" role="status">Loading {{ catalogue.singular }}…</p>
    <UAlert
      v-else-if="!dish"
      color="neutral"
      :title="`${catalogue.singular} not found`"
    />
    <template v-else>
      <header class="dish-header">
        <UAvatar
          :src="dish.image || undefined"
          :alt="dish.name"
          icon="i-lucide-utensils"
          class="dish-image"
        />
        <div class="min-w-0 flex-1">
          <p class="text-xs uppercase tracking-widest text-muted">
            {{ selectedKitchen?.name }} ·
            {{
              catalogue.itemKind === 'food'
                ? dishCategoryLabel(dish.category)
                : catalogue.singular
            }}
          </p>
          <h1 class="text-3xl font-semibold tracking-tight mt-2">
            {{ dish.name }}
          </h1>
          <p v-if="dish.description" class="mt-2 text-muted max-w-2xl">
            {{ dish.description }}
          </p>
          <div v-if="dish.spec" class="flex flex-wrap gap-2 mt-3">
            <UBadge color="neutral" variant="soft"
              >{{ dish.spec.portion }} portion{{
                dish.spec.portion === 1 ? '' : 's'
              }}</UBadge
            ><span class="text-sm text-muted">{{ dish.spec.station }}</span>
          </div>
        </div>
        <UButton
          v-if="canWrite"
          icon="i-lucide-settings-2"
          label="Manage dish"
          color="neutral"
          variant="outline"
          @click="manage = true"
        />
      </header>
      <nav aria-label="Dish perspectives" class="dish-tabs">
        <UButton
          v-for="item in views"
          :key="item.id"
          :to="{ query: { ...route.query, view: item.id } }"
          :icon="item.icon"
          :label="item.label"
          :color="view === item.id ? 'primary' : 'neutral'"
          :variant="view === item.id ? 'soft' : 'ghost'"
          :aria-current="view === item.id ? 'page' : undefined"
        />
      </nav>
      <WorkspaceKitchenDishesPricing v-if="view === 'pricing'" />
      <DishPreparation v-if="view === 'preparation'" />
      <DishMenus v-else-if="view === 'menus'" />
      <UModal
        v-model:open="manage"
        title="Manage dish"
        description="Identity and record settings."
      >
        <template #body
          ><div class="grid gap-5">
            <WorkspaceKitchenDishesEdit />
            <details>
              <summary class="text-sm text-muted cursor-pointer">
                Remove dish
              </summary>
              <div class="mt-4">
                <WorkspaceKitchenDishesDelete :remove="removeDish" />
              </div>
            </details></div
        ></template>
      </UModal>
    </template>
    <DishSpec
      v-if="
        view === 'spec' && storageKitchenId && dishId && outcome !== 'missing'
      "
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { useDishDelete } from '../../../../composables/dish/useDishDelete'
import { useDishEditorScope } from '../../../../composables/dish/useDishEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import DishSpec from '../Spec.vue'
import DishMenus from '../Menus.vue'
import { dishCategoryLabel } from '../../../../models/dish.model'
import DishPreparation from '../Preparation.vue'
import { useKitchenWorkspaceDish } from '../../../../composables/workspace/dishes/useKitchenWorkspaceDish'
const {
  dish,
  dishId,
  kitchenId,
  storageKitchenId,
  pending,
  error,
  outcome,
  canWrite,
  catalogue,
  selectedKitchen,
} = useKitchenWorkspaceDish()
const route = useRoute()
const manage = ref(false)
const { deleteDish } = useDishDelete()
const toast = useToastify()
const captureIntent = useDishEditorScope(
  [kitchenId, dishId, () => route.fullPath],
  () => {
    manage.value = false
  }
)
async function removeDish() {
  if (!canWrite.value || !dish.value) throw new Error('This Dish is read-only.')
  const isCurrent = captureIntent()
  const targetId = dishId.value,
    targetKitchen = kitchenId.value
  const destination = catalogue.path,
    label = catalogue.singular
  await deleteDish(targetId, { kitchenId: targetKitchen })
  if (!isCurrent()) return
  toast.add({ title: `${label} deleted`, icon: 'i-heroicons-check-circle' })
  await navigateTo(destination)
}
const catalogueReturn = computed(() => ({
  path: catalogue.path,
  query: Object.fromEntries(
    ['category', 'search', 'filter', 'layout'].flatMap((key) =>
      typeof route.query[key] === 'string' ? [[key, route.query[key]]] : []
    )
  ),
}))
const menuReturn = computed(() =>
  typeof route.query.menu === 'string' &&
  typeof route.query.section === 'string'
    ? `/workspace/kitchen/menus/${encodeURIComponent(route.query.menu)}/${encodeURIComponent(route.query.section)}`
    : ''
)
const views = [
  { id: 'pricing', label: 'Pricing', icon: 'i-lucide-tag' },
  { id: 'spec', label: 'Spec', icon: 'i-lucide-book-open' },
  { id: 'preparation', label: 'Preparation', icon: 'i-lucide-list-checks' },
  { id: 'menus', label: 'Menus', icon: 'i-lucide-calendar-days' },
]
const view = computed(() =>
  views.some((item) => item.id === route.query.view)
    ? String(route.query.view)
    : 'spec'
)
</script>
<style scoped>
.dish-workspace {
  display: grid;
  gap: 1.75rem;
  max-width: 80rem;
  margin-inline: auto;
  padding-bottom: 2rem;
}
.dish-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}
.dish-image {
  width: 5rem;
  height: 5rem;
  border-radius: 1.25rem;
  flex-shrink: 0;
}
.dish-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--ui-border);
  padding-bottom: 0.75rem;
}
.dish-tabs > * {
  flex-shrink: 0;
}
@media (max-width: 640px) {
  .dish-header {
    gap: 1rem;
  }
  .dish-image {
    width: 3.5rem;
    height: 3.5rem;
  }
}
</style>
