<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar :alt="title" icon="i-lucide-briefcase-business" size="md" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badgeItems.length" class="card__badges">
            <UBadge
              v-for="badge in badgeItems"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showMeta" class="card__subtitle">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="fx-card__tagline--empty">missing</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioCard } from '../../composables/firestore/utils/view/usePortfolioInterface'

type PortfolioCellProps = Pick<
  PortfolioCard.Card,
  | 'to'
  | 'title'
  | 'subtitle'
  | 'badges'
  | 'ownerLabel'
  | 'status'
  | 'regionLabel'
> & {
  showSubtitle?: boolean
  showMeta?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PortfolioCellProps>(), {
  badges: () => [],
  showSubtitle: true,
  showMeta: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})

const badgeItems = computed(() =>
  [...props.badges, props.status].filter(Boolean)
)
const meta = computed(() =>
  [props.ownerLabel, props.status ? `status ${props.status}` : '']
    .filter(Boolean)
    .join(' · ')
)
</script>
