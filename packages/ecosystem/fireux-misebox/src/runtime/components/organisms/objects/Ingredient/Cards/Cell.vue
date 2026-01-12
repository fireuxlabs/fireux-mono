<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__title">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="fx-cell__subtitle">{{ vmSubtitle }}</div>
        <div v-if="prop" class="fx-cell__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Ingredient } from '../../../../../models/objects/Ingredient.model'
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/objects/ingredient/utils/view/useIngredientInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  ingredient?: Ingredient | null
  prop?: string
}>()
const { cellProps } = useIngredientInterface()

const resolved = computed(() => cellProps(props.ingredient ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value.category ?? resolved.value.subtitle ?? undefined
)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
