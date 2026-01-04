<template>
  <NuxtLink :to="to" class="fx-card fx-card--pill">

    <UAvatar
      :src="avatar || undefined"
      :alt="title"
      size="xs"
    />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">
        {{ title }}
      </div>
    </div>

    <div v-if="badges.length" class="ml-2 flex shrink-0 items-center gap-1">
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
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

defineOptions({ inheritAttrs: false })

defineProps<Pick<AppCard.Card, 'to' | 'avatar' | 'title' | 'badges'>>()
</script>
