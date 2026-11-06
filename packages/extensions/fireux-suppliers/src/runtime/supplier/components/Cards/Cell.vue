<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar :src="avatarUrl || undefined" :alt="title" size="md" />

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

        <div v-if="showTagline" class="card__subtitle">
          <span v-if="summary">{{ summary }}</span>
          <span v-else class="fx-card__tagline--empty">missing</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../composables/firestore/utils/view/useSupplierInterface'

type Props = Pick<
  SupplierCard.Card,
  'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges' | 'summary'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
  disabled: false,
})
</script>
