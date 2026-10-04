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
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading ingredient...
      </div>

      <MoleculesStateCard
        v-else-if="fetchError"
        entity="Ingredient"
        state="error"
        surface="bare"
      />

      <div v-else-if="!ingredient" class="space-y-2">
        <h1 class="text-lg font-semibold">Ingredient Not Found</h1>
        <p>The ingredient you are looking for does not exist.</p>
        <NuxtLink to="/ingredients" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-if="isAdmin && ingredient" class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-pencil"
            @click="showAdmin = !showAdmin"
          >
            {{ showAdmin ? 'Hide edit' : 'Edit' }}
          </UButton>
        </div>

        <IngredientCardsProfile
          v-if="ingredientProfile"
          :model="ingredientProfile"
        />

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          :title="'Ingredient (Doc)'"
          context="Ingredient detail page · ingredients/[id] · ingredient doc"
          :objects="{ ingredient }"
          :derived="{ docId, outcome: ingredient ? 'found' : 'not-found' }"
          :default-open="false"
        />

        <IngredientEdit
          v-if="isAdmin && showAdmin"
          :ingredient-id="docId"
          :ingredient="ingredient"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { useRoute } from '#imports'
import { computed, ref } from 'vue'
import { useIngredientDetail } from '../../ingredient/composables/useIngredientDetail'
import { useIngredientInterface } from '../../ingredient/composables/useIngredientInterface'
import { useIngredientSeo } from '../../ingredient/composables/useIngredientSeo'

definePageMeta({
  layout: 'default',
  title: 'Ingredient',
  description: 'View a saved ingredient.',
})

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { profile } = useIngredientInterface()
const { isAdmin } = useUserSession()

const detail = useIngredientDetail(docId)
const ingredient = detail.ingredient
const loading = detail.pending
const fetchError = detail.error

const ingredientProfile = computed(() => profile(ingredient.value))

const showAdmin = ref(false)

const pageTitle = computed(() => ingredient.value?.name || 'Ingredient')
const pageDescription = computed(() => 'Ingredient details.')

useIngredientSeo(ingredient)
</script>
