<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue -->
<template>
  <NuxtLink :to="to" class="fx-card fx-card--pill">
    <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">
        {{ displayName }}
      </div>

      <div v-if="showSubtitle && ecosystem" class="min-w-0 truncate text-xs text-dimmed">
        {{ ecosystem }}
      </div>
    </div>

    <div v-if="showBadges && badges.length" class="ml-2 flex shrink-0 items-center gap-1">
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

withDefaults(
  defineProps<
    Pick<AppCard.Card, 'to' | 'avatarUrl' | 'displayName' | 'ecosystem' | 'badges'> & {
      showSubtitle?: boolean
      showBadges?: boolean
    }
  >(),
  {
    showSubtitle: true,
    showBadges: true,
  }
)
</script>