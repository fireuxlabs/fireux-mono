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
import type { Recipe } from '../../../../../models/objects/Recipe.model'
import { useRecipeInterface } from '../../../../../composables/fireux/firestore/objects/recipe/utils/view/useRecipeInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  recipe?: Recipe | null
  prop?: string
}>()
const { cellProps } = useRecipeInterface()

const resolved = computed(() => cellProps(props.recipe ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(
  () => props.subtitle ?? resolved.value.status ?? resolved.value.subtitle ?? undefined
)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
