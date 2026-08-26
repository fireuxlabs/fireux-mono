<template>
  <section
    aria-labelledby="workspace-capabilities"
    class="grid gap-5 border-t border-default pt-6"
  >
    <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div class="grid max-w-2xl gap-1">
        <h2
          id="workspace-capabilities"
          class="m-0 text-2xl font-semibold text-highlighted"
        >
          What you can do
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Work with Menus, preparation, service and the records behind them.
        </p>
      </div>
      <UButton
        to="/operations"
        label="All Kitchen operations"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>

    <div class="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="operation in operations"
        :key="operation.to"
        :to="operation.to"
        class="group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-default py-4"
      >
        <UIcon :name="operation.icon" class="mt-0.5 size-5 text-primary" />
        <span class="min-w-0">
          <strong class="block text-sm font-semibold text-highlighted">
            {{ operation.label }}
          </strong>
          <span class="mt-1 block text-sm leading-5 text-muted">
            {{ operation.description }}
          </span>
        </span>
        <UIcon
          name="i-lucide-arrow-up-right"
          class="mt-0.5 size-4 text-dimmed transition group-hover:text-primary"
        />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const operations = [
  [
    'Restaurant Menus',
    'Create, structure and publish restaurant Menus.',
    '/operations/menus',
    'i-lucide-book-open',
  ],
  [
    'Dishes',
    'Manage the Dishes used across Menus and Recipes.',
    '/operations/dishes',
    'i-lucide-utensils',
  ],
  [
    'Recipes',
    'Maintain Recipe ingredients, methods and yields.',
    '/operations/recipes',
    'i-lucide-notebook-tabs',
  ],
  [
    'Kitchen prep',
    'Plan and track preparation work before service.',
    '/operations/mise',
    'i-lucide-list-checks',
  ],
  [
    'Restaurant orders',
    'Run the Kitchen order board and service queue.',
    '/operations/orders',
    'i-lucide-receipt-text',
  ],
  [
    'Kitchen sales',
    'Review bounded sales measures by period.',
    '/operations/finance',
    'i-lucide-chart-column',
  ],
  [
    'Suppliers',
    'Connect Suppliers, catalogues and supply options.',
    '/operations/suppliers',
    'i-lucide-truck',
  ],
  [
    'Ingredients',
    'Maintain the Ingredients used by the Kitchen.',
    '/operations/ingredients',
    'i-lucide-carrot',
  ],
].map(([label, description, to, icon]) => ({ label, description, to, icon }))
</script>
