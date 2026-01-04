<template>
  <div
    class="fx-pill"
  >
    <UAvatar :src="avatar || undefined" :alt="title" size="xs" />
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

const { card, avatar: avatarProp } = defineProps<{
  card: PlaceCard.Cell
  avatar?: string | null
}>()

const { name, formatted_address, avatar: cardAvatar } = card
const title = name
const subtitle = formatted_address
const avatar = avatarProp ?? cardAvatar ?? null
</script>
