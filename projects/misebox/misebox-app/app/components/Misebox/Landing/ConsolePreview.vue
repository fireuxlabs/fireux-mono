<template>
  <UCard
    as="section"
    aria-label="Interactive operations preview"
    class="overflow-hidden"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <div
      class="grid min-h-[32rem] grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[12rem_minmax(0,1fr)]"
    >
      <aside class="border-r border-default bg-elevated/70 p-3">
        <div class="flex items-center gap-2 px-1 py-2">
          <UIcon
            name="i-lucide-chef-hat"
            class="size-5 shrink-0 text-primary"
          />
          <span class="hidden text-sm font-semibold text-highlighted sm:block">
            Kitchen
          </span>
        </div>

        <nav class="mt-3 grid gap-1" aria-label="Kitchen Operations">
          <button
            v-for="operation in operations"
            :key="operation.id"
            type="button"
            class="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-toned transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="operation.id === selectedOperationId
              ? 'bg-primary/10 text-primary'
              : ''"
            :aria-label="operation.title"
            :aria-current="operation.id === selectedOperationId
              ? 'page'
              : undefined"
            :title="operation.title"
            @click="selectedOperationId = operation.id"
          >
            <UIcon :name="operation.icon" class="size-4 shrink-0" />
            <span class="hidden truncate sm:block">{{ operation.title }}</span>
          </button>
        </nav>
      </aside>

      <div
        v-if="selectedOperation"
        class="min-w-0 bg-default p-4 sm:p-5"
      >
        <header
          class="border-b border-default pb-4"
        >
          <p class="truncate font-semibold text-highlighted">
            {{ selectedOperation.title }}
          </p>
        </header>

        <div
          v-if="selectedOperation.id === 'kitchen.menus'"
          :key="selectedOperation.id"
          class="mt-5"
          aria-label="Menus preview"
        >
          <div
            v-if="productDemo?.console.menus.length"
            class="console-preview-menus"
          >
            <article
              v-for="menu in productDemo.console.menus"
              :key="menu.id"
              class="console-preview-menu-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default shadow-sm"
            >
              <img
                v-if="menu.imageUrl"
                :src="menu.imageUrl"
                :alt="menu.imageAlt"
                class="aspect-square w-full object-cover"
                loading="lazy"
              >
              <div
                v-else
                class="flex aspect-square w-full items-center justify-center bg-elevated text-muted"
                aria-hidden="true"
              >
                <UIcon name="i-lucide-image" class="size-6" />
              </div>

              <div class="flex min-w-0 items-center gap-2 border-t border-default px-3 py-2.5">
                <p class="truncate text-xs font-semibold text-highlighted">
                  {{ menu.name }}
                </p>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="ml-auto size-3.5 shrink-0 text-muted"
                />
              </div>
            </article>

            <article
              class="console-preview-menu-card console-preview-create-card flex min-w-0 flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm"
            >
              <div class="flex min-h-0 flex-1 items-center justify-center">
                <span class="flex size-10 items-center justify-center rounded-full bg-primary text-inverted shadow-sm">
                  <UIcon name="i-lucide-plus" class="size-5" />
                </span>
              </div>
              <div class="flex items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-2.5">
                <p class="text-xs font-semibold text-highlighted">
                  Create menu
                </p>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="ml-auto size-3.5 shrink-0 text-muted"
                />
              </div>
            </article>
          </div>

          <UAlert
            v-else-if="productDemoError"
            color="neutral"
            variant="soft"
            title="Menu preview unavailable"
            description="No Demo Kitchen data was loaded."
          />
        </div>

        <div
          v-else-if="selectedOperation.id === 'kitchen.dishes'"
          :key="selectedOperation.id"
          class="mt-5"
          aria-label="Dishes preview"
        >
          <article
            v-if="selectedDish?.spec.id"
            class="mb-3 rounded-xl border border-default bg-elevated/40 p-3"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  {{ selectedDish.name }} spec
                </p>
                <p class="mt-1 text-xs text-muted">
                  {{ selectedDish.spec.summary }}
                </p>
              </div>
              <UBadge color="neutral" variant="soft" size="sm">
                {{ selectedDish.spec.station }}
              </UBadge>
            </div>
            <ol class="mt-3 grid gap-1 text-xs text-toned">
              <li
                v-for="(step, index) in selectedDish.spec.assembly"
                :key="step"
              >
                {{ Number(index) + 1 }}. {{ step }}
              </li>
            </ol>
          </article>

          <div
            v-if="productDemo?.console.dishes.length"
            class="console-preview-dishes max-h-[24rem] overflow-y-auto pr-1"
          >
            <ConsoleKitchenOperationsDishesCardsCell
              v-for="dish in productDemo.console.dishes"
              :id="dish.id"
              :key="dish.id"
              :title="dish.name"
              :image-url="dish.imageUrl"
              :meta="dish.kind"
              :price-label="dish.priceLabel"
              :action="Boolean(dish.spec.id)"
              class="w-28 sm:w-32"
              :class="dish.id === selectedDish?.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-default'
                : ''"
              @action="selectedDishId = dish.id"
            />

            <article
              class="flex aspect-[4/5] w-28 flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm sm:w-32"
            >
              <div class="flex min-h-0 flex-1 items-center justify-center">
                <span class="flex size-9 items-center justify-center rounded-full bg-primary text-inverted shadow-sm">
                  <UIcon name="i-lucide-plus" class="size-4" />
                </span>
              </div>
              <div class="flex items-center gap-2 border-t border-primary/15 bg-default/70 px-3 py-2.5">
                <p class="truncate text-xs font-semibold text-highlighted">
                  Create dish
                </p>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="ml-auto size-3.5 shrink-0 text-muted"
                />
              </div>
            </article>
          </div>

          <UAlert
            v-else-if="productDemoError"
            color="neutral"
            variant="soft"
            title="Dish preview unavailable"
            description="No Demo Kitchen data was loaded."
          />
        </div>

        <div
          v-else-if="selectedOperation.id === 'kitchen.recipes'"
          :key="selectedOperation.id"
          class="mt-5"
          aria-label="Recipes preview"
        >
          <div
            v-if="productDemo?.console.recipes.length"
            class="grid max-h-[24rem] gap-2 overflow-y-auto sm:grid-cols-2"
          >
            <article
              v-for="recipe in productDemo.console.recipes"
              :key="recipe.id"
              class="rounded-xl border border-default bg-default p-3 shadow-sm"
            >
              <p class="text-sm font-semibold text-highlighted">
                {{ recipe.name }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <UBadge color="neutral" variant="soft" size="sm">
                  {{ recipe.yield }}
                </UBadge>
                <UBadge color="neutral" variant="outline" size="sm">
                  {{ recipe.ingredientCount }} ingredients
                </UBadge>
              </div>
              <p class="mt-2 text-xs leading-5 text-muted">
                {{ recipe.method.join(' ') }}
              </p>
            </article>
          </div>
        </div>

        <div
          v-else-if="selectedOperation.id === 'kitchen.mise'"
          :key="selectedOperation.id"
          class="mt-5"
          aria-label="Mise en place preview"
        >
          <div
            v-if="productDemo?.console.mise.length"
            class="grid max-h-[24rem] gap-2 overflow-y-auto"
          >
            <article
              v-for="requirement in productDemo.console.mise"
              :key="requirement.id"
              class="flex items-start gap-3 rounded-xl border border-default bg-default p-3 shadow-sm"
            >
              <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-list-checks" class="size-4" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-highlighted">
                  {{ requirement.title }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  {{ requirement.station }} · {{ requirement.quantity }}
                </p>
              </div>
              <UBadge
                v-if="requirement.recipeId"
                color="neutral"
                variant="soft"
                size="sm"
              >
                Recipe
              </UBadge>
            </article>
          </div>
        </div>

        <div
          v-else
          :key="selectedOperation.id"
          class="mt-5 min-h-[20rem] rounded-xl border border-dashed border-default bg-elevated/20"
          :aria-label="`${selectedOperation.title} page canvas`"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { kitchenOperations } from 'fireux-kitchens/runtime/content/operations'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

const operations = kitchenOperations
type ProductDemoDish = MiseboxProductDemo['console']['dishes'][number]
const selectedOperationId = ref('kitchen.menus')
const selectedDishId = ref('deanos-classic')
const selectedOperation = computed(() =>
  operations.find(operation => operation.id === selectedOperationId.value)
  || operations[0]
)
const {
  data: productDemo,
  error: productDemoError,
} = await useMiseboxProductDemo()
const selectedDish = computed(() =>
  productDemo.value?.console.dishes.find(
    (dish: ProductDemoDish) => dish.id === selectedDishId.value
  )
  || productDemo.value?.console.dishes.find(
    (dish: ProductDemoDish) => dish.spec.id
  )
  || null
)
</script>

<style scoped>
.console-preview-menus {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
}

.console-preview-menu-card {
  width: 100%;
}

.console-preview-create-card {
  aspect-ratio: 1;
}

.console-preview-dishes {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}

@media (min-width: 640px) {
  .console-preview-menus {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 3);
  }

  .console-preview-menu-card {
    flex: 0 0 calc(var(--spacing) * 30);
  }
}
</style>
