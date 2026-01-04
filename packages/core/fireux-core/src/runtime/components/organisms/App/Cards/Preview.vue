<template>
  <UCard class="fx-card fx-card--preview space-y-3">
    <div class="fx-card__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="fx-card__content space-y-1">
        <div class="fx-card__header">
          <div class="min-w-0">
            <div class="fx-card__title">{{ title }}</div>
            <div v-if="subtitle" class="fx-card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="badges.length" class="fx-card__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

defineOptions({ inheritAttrs: false })

defineProps<Pick<AppCard.Card, 'avatar' | 'title' | 'subtitle' | 'badges'>>()
</script>
