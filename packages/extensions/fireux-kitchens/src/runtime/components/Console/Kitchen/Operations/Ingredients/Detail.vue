<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/ingredients"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to ingredients
    </UButton>

    <IngredientProfile v-if="profile" :model="profile" />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading ingredient' : 'Ingredient not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen ingredient.'
          : `No ingredient was found for ${ingredientId || 'this route'}.`
      "
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen ingredient detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIngredient } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIngredient'
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'
import IngredientProfile from '../../../../Ingredient/Cards/Profile.vue'

const { profile: makeProfile } = useIngredientInterface()
const { ingredient, ingredientId, pending, debug } = useKitchenConsoleIngredient()
const profile = computed(() => makeProfile(ingredient.value))
const isDev = import.meta.dev
</script>
