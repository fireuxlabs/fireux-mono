<template>
  <NuxtLink
    v-if="props.card"
    :to="props.card.to"
    class="fx-pill"
  >
    <UAvatar
      :src="props.card.avatar || undefined"
      :alt="props.card.title"
      size="xs"
    />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">
        {{ props.card.title }}
      </div>
      <div v-if="props.card.subtitle" class="min-w-0 truncate text-xs text-dimmed">
        {{ props.card.subtitle }}
      </div>
    </div>

    <div
      v-if="props.card.badges.length"
      class="ml-2 flex shrink-0 items-center gap-1"
    >
      <UBadge
        v-for="badge in props.card.badges"
        :key="badge"
        variant="soft"
        color="neutral"
        size="xs"
      >
        {{ badge }}
      </UBadge>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const props = withDefaults(
  defineProps<{
    card: AppCard.Card | null
  }>(),
  {
    card: null,
  },
)
</script>
