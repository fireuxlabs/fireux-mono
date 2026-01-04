<template>
  <div
    class="fx-pill"
  >
    <UAvatar :src="avatar || undefined" :alt="title" size="xs" />
    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ title }}</div>
      <div v-if="subtitle" class="min-w-0 truncate text-xs text-dimmed">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CompanyCard } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

const { card, avatar: avatarProp } = defineProps<{
  card: CompanyCard.Pill
  avatar?: string | null
}>()

const { title, subtitle } = card
const avatar = avatarProp ?? null
</script>
