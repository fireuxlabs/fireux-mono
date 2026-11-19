<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="avatarUrl || undefined"
        :style="
          imageFit === 'contain' && imageBackground
            ? { backgroundColor: imageBackground }
            : undefined
        "
        :ui="imageFit === 'contain' ? { image: 'object-contain' } : undefined"
        icon="i-lucide-store"
        size="md"
        class="fx-card__badge"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop || summary">{{ prop || summary }}</span>
          <span v-else>{{ id }}</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { SupplierCard } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<{
    to?: string
    id: string
    title: string
    subtitle: string
    avatarUrl: string
    imageFit?: 'contain' | 'cover'
    imageBackground?: string
    badges?: SupplierCard.Card['badges']
    summary?: SupplierCard.Card['summary']
    prop?: string
    showSubtitle?: boolean
    showBadges?: boolean
    showTagline?: boolean
    link?: boolean
    action?: boolean
  }>(),
  {
    badges: () => [],
    summary: '',
    prop: '',
    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    link: false,
    action: false,
  }
)
</script>
