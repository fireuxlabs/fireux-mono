<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="name" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ name }}</div>
            <div v-if="showSubtitle && website" class="fx-cell__subtitle">
              {{ website }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-cell__badges">
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

        <div v-if="showTagline" class="fx-cell__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { KitchenCard } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'

type Props = Pick<KitchenCard.Card, 'to' | 'name' | 'website' | 'badges'> & {
  prop?: string
  avatarUrl?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
}

withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
})
</script>
