<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Recipe } from '../../../../../models/Recipe.model';
import { useRecipeInterface } from '../../../../composables/fireux/firestore/recipe/utils/view/useRecipeInterface';

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  recipe?: Recipe | null
  prop?: string
}>()
const { pillProps } = useRecipeInterface()

const resolved = computed(() => pillProps(props.recipe ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(() => props.subtitle ?? resolved.value.subtitle ?? undefined)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
