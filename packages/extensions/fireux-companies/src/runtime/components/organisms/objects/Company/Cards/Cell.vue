<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__title">{{ title }}</div>
        <div v-if="resolvedSubtitle" class="fx-cell__subtitle">
          {{ resolvedSubtitle }}
        </div>
        <div v-if="prop" class="fx-cell__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CompanyCard } from '../../../../../composables/fireux/firestore/objects/company/utils/view/useCompanyInterface'

const { card, avatar: avatarProp, prop } = defineProps<{
  card: CompanyCard.Cell
  avatar?: string | null
  prop?: string
}>()

const { title, subtitle, website, formatted_address } = card
const avatar = avatarProp ?? null
const resolvedSubtitle = website ?? formatted_address ?? subtitle
</script>
