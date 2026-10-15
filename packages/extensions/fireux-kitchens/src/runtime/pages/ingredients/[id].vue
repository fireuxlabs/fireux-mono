<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
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
      <MoleculesStateCard
        v-if="outcome === 'error'"
        entity="Ingredient"
        state="error"
        surface="bare"
      />

      <div
        v-else-if="outcome === 'pending'"
        class="py-10 text-sm opacity-70"
        role="status"
      >
        Loading ingredient...
      </div>

      <div v-else-if="!ingredient" class="space-y-2">
        <h1 class="text-lg font-semibold">Ingredient Not Found</h1>
        <p>The ingredient you are looking for does not exist.</p>
        <NuxtLink to="/ingredients" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <IngredientDetail v-else :ingredient="ingredient" />

      <DiagnosticsDebugPanel
        v-if="ingredient"
        object-origin="fetched"
        launcher
        include-route
        :title="'Ingredient (Doc)'"
        context="Ingredient detail page · ingredients/[id] · ingredient doc"
        :objects="{ ingredient }"
        :derived="{ docId, outcome: ingredient ? 'found' : 'not-found' }"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Ingredient',
  description: 'View a saved ingredient.',
})

import { useRoute } from '#imports'
import { computed } from 'vue'
import { useIngredientDetail } from '../../ingredient/composables/useIngredientDetail'

import { useIngredientSeo } from '../../ingredient/composables/useIngredientSeo'

const route = useRoute()
const docId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
})

const detail = useIngredientDetail(docId)
const ingredient = detail.ingredient
const outcome = detail.outcome

const pageTitle = computed(() => ingredient.value?.name || 'Ingredient')
const pageDescription = computed(() => 'Ingredient details.')

useIngredientSeo(ingredient)
</script>
