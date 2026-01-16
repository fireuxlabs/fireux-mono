<template>
  <div class="fx-card fx-card--pill">
    <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ displayName }}</div>
      <div v-if="showSubtitle && tagline" class="min-w-0 truncate text-xs text-dimmed">
        {{ tagline }}
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
  </div>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier';

withDefaults(
  defineProps<
    Pick<SupplierCard.Card, 'to' | 'avatarUrl' | 'displayName' | 'tagline' | 'badges'> & {
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
