<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        class="bg-white dark:bg-white"
        size="sm"
      />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ title }}</div>
        <div v-if="subtitle" class="truncate text-sm text-dimmed">
          {{ subtitle }}
        </div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

const { card, imageUrl: imageUrlProp, prop } = defineProps<{
  card: PlaceCard.Cell
  imageUrl?: string
  prop?: string
}>()

const { name, formatted_address, imageUrl: cardImageUrl } = card
const title = name
const subtitle = formatted_address
const imageUrl = imageUrlProp ?? cardImageUrl
</script>
