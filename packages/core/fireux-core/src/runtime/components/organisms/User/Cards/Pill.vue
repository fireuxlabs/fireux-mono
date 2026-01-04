<template>
  <NuxtLink
    :to="card.to"
    class="fx-pill"
  >
    <UAvatar :src="card.avatar || undefined" :alt="card.title" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ card.title }}</div>
      <div v-if="card.subtitle" class="min-w-0 truncate text-xs text-dimmed">
        {{ card.subtitle }}
      </div>
    </div>

    <div v-if="card.badges.length" class="ml-2 flex shrink-0 items-center gap-1">
      <UBadge
        v-for="badge in card.badges"
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
import { toRef } from 'vue'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const props = defineProps<{ card: UserCard.Card }>()

const card = toRef(props, 'card')
</script>
