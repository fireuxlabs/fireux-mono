<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Recipes</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No recipes yet.
    </div>

    <OrganismsEntitiesRecipeCollectionList
      v-else
      :cards="cards"
      :variant="variant"
    />

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Recipes (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRecipeInterface } from '../../../../../composables/fireux/firestore/objects/recipe/utils/view/useRecipeInterface';
import type { Recipe } from '../../../../../models/objects/Recipe.model';

const props = defineProps<{ collection?: Recipe[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = useRecipeInterface()
type RecipeCardShape = NonNullable<ReturnType<typeof makeCard>>
const cards = computed(() =>
  collection.value
    .map((recipe) => makeCard(recipe))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalRecipes: collection.value.length,
  recipes: collection.value,
}))

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('pill')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

</script>
