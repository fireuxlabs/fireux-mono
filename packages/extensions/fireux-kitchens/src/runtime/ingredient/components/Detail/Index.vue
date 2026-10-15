<template>
  <div class="space-y-4">
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

    <IngredientDetailSummary
      v-if="ingredientProfile"
      :model="ingredientProfile"
    />

    <IngredientEdit
      v-if="isAdmin && showAdmin"
      :ingredient-id="ingredient.id"
      :ingredient="ingredient"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import type { Ingredient } from '../../models/ingredient.model'
import { useIngredientInterface } from '../../composables/useIngredientInterface'
const props = defineProps<{ ingredient: Ingredient }>()
const { isAdmin } = useUserSession()
const { profile } = useIngredientInterface()
const ingredientProfile = computed(() => profile(props.ingredient))
const showAdmin = ref(false)
watch(
  () => props.ingredient.id,
  () => {
    showAdmin.value = false
  },
  { flush: 'sync' }
)
</script>
