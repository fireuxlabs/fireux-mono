<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto grid max-w-5xl gap-8">
      <header class="grid gap-3">
        <NuxtLink
          to="/tools"
          class="w-fit text-sm font-semibold text-primary hover:underline"
          >Tools</NuxtLink
        >
        <h1 class="m-0 text-3xl font-semibold text-highlighted">
          Kitchen tools
        </h1>
        <p class="m-0 max-w-3xl text-muted">
          Human actions and compound workflows provided by FireUX Kitchens.
          Execution remains inside an authorized Kitchen Workspace.
        </p>
      </header>
      <section v-for="group in groups" :key="group.title" class="grid gap-3">
        <h2 class="m-0 text-xl font-semibold text-highlighted">
          {{ group.title }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UCard v-for="item in group.items" :key="item">{{ item }}</UCard>
        </div>
      </section>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const groups = [
  {
    title: 'Team primitives',
    items: [
      'Read team',
      'Add member',
      'Update member',
      'Delete member',
      'Create invitation',
    ],
  },
  {
    title: 'Mise primitives',
    items: [
      'Add prep task',
      'Update prep task',
      'Change prep status',
      'Delete prep task',
    ],
  },
  {
    title: 'Compound workflows',
    items: ['Onboard member from dossier', 'Import a menu'],
  },
] as const

definePageMeta({
  layout: 'landing',
  toolCatalogue: {
    owner: 'FireUX Kitchens',
    title: 'Kitchen tools',
    description: 'Kitchen primitives and source-proven compound workflows.',
  },
})
</script>
