<template>
  <div class="fx-card fx-card--pill">
    <UAvatar :src="imageUrl || undefined" :alt="title" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ title }}</div>
      <div v-if="subtitle" class="min-w-0 truncate text-xs text-dimmed">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

defineOptions({ inheritAttrs: false })

const { name: title, formatted_address: subtitle, imageUrl } = defineProps<Pick<PlaceCard.Pill, 'name' | 'imageUrl'> & Pick<PlaceCard.Cell, 'formatted_address'>>()
</script>
