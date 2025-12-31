<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
      </div>
    </div>
  </UCard>
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
}>()

const { pillProps } = useIngredientInterface()

const resolved = computed(() => pillProps(props.ingredient ?? null))

const vmTitle = computed(() => props.title ?? resolved.value.title)
const vmSubtitle = computed(() => props.subtitle ?? resolved.value.subtitle ?? undefined)
const vmAvatar = computed(() => props.avatar ?? null)
</script>
