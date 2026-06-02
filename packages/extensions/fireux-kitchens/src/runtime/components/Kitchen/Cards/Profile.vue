<template>
  <UCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        icon="i-lucide-image"
        size="3xl"
        :class="avatarShadeClass"
      />

      <div class="min-w-0 flex-1 space-y-3">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            Kitchen
          </div>
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ card.title }}
          </h2>
          <p v-if="card.subtitle" class="max-w-3xl text-sm text-toned">
            {{ card.subtitle }}
          </p>
          <p v-if="card.prop" class="max-w-3xl text-sm text-muted">
            {{ card.prop }}
          </p>
        </div>

        <div
          v-if="card.verified || sourceLabel || card.badges.length"
          class="flex flex-wrap gap-2"
        >
          <UBadge v-if="card.verified" color="primary" variant="soft">
            Verified
          </UBadge>
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
          <UBadge v-if="sourceLabel" color="neutral" variant="soft">
            {{ sourceLabel }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCard } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{ card: KitchenCard.Profile }>()

const avatarShadeClass = computed(() => {
  const shade = props.card.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const sourceLabel = computed(() =>
  props.card.source === 'fireux'
    ? 'FireUX'
    : props.card.source === 'manual'
      ? 'Manual'
      : props.card.source === 'google'
        ? 'Google'
        : ''
)
</script>
