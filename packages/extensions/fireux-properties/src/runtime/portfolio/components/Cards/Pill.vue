<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    class="pill"
    @activate="emit('action')"
  >
    <div class="card__media fx-card__media--start">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
      />

      <div class="card__content card__stack">
        <p class="card__title">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="card__subtitle">
          {{ subtitle }}
        </p>
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
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioCard } from '../../composables/firestore/utils/view/usePortfolioInterface'

type PillProps = Pick<PortfolioCard.Card, 'to' | 'title' | 'subtitle'> & {
  badges?: PortfolioCard.Card['badges']
  status?: PortfolioCard.Card['status']
  imageUrl?: string
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})

const badgeItems = computed(() =>
  [...(props.badges ?? []), props.status].filter(Boolean)
)
</script>
