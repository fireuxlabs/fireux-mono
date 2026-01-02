<template>
  <div
    class="fx-pill"
  >
    <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ vmTitle }}</div>
      <div v-if="vmSubtitle" class="min-w-0 truncate text-xs text-dimmed">{{ vmSubtitle }}</div>
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
}>()

const { pillProps } = useRecipeInterface()

const resolved = computed(() => pillProps(props.recipe ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(() => props.subtitle ?? resolved.value.subtitle ?? undefined)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
