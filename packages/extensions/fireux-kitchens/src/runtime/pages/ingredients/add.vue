<template>
  <UPage>
    <UPageHeader
      title="Add Ingredient"
      description="Create a global ingredient record."
    >
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/ingredients"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <IngredientCreate @created="handleCreated" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-22 16:08 CEST — Misebox operations shortcuts: keep the hidden Ingredient creator out of entity discovery.
import { navigateTo, useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Add Ingredient',
  description: 'Create a global ingredient.',
  nav: {
    key: 'ingredients-add',
    label: 'Add Ingredient',
    icon: 'i-lucide-plus',
    desktop: false,
    mobile: false,
    hidden: true,
    layouts: ['default'],
  },
  requiresAuth: true,
  roles: ['admin'],
})

const { appName } = useFireUXConfig()

const handleCreated = async (id: string) => {
  await navigateTo(`/ingredients/${encodeURIComponent(id)}`)
}

useHead({ title: `${appName} | Add Ingredient` })
</script>
