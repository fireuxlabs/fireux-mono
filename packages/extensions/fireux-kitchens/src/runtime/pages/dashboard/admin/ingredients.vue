<template>
  <UPage>
    <UPageHeader
      title="Ingredients"
      description="Curate the shared Ingredient world used by Kitchen and Supplier operations."
    >
      <template #ctas>
        <UButton to="/ingredients/add" icon="i-lucide-plus" size="sm">
          Add Ingredient
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <IngredientCollectionManager
        title="Canonical library"
        description="All active, deprecated, and merged Ingredient roots. Open one to edit, reactivate, retire, or merge it."
        include-inactive
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'ingredients',
    domain: 'ingredients',
    label: 'Ingredients',
    description: 'Curate the canonical Ingredient library.',
    icon: 'i-lucide-carrot',
    order: 140,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
