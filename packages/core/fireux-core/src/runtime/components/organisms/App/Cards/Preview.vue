<template>
  <UCard class="fx-preview">
    <div class="fx-preview__row">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="fx-preview__main">
        <div class="fx-preview__top">
          <div class="fx-preview__title">{{ displayName }}</div>

          <div v-if="showBadges && badges.length" class="fx-preview__badges">
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

        <div v-if="showSubtitle && ecosystem" class="fx-preview__subtitle">
          {{ ecosystem }}
        </div>

        <div v-if="showBody" class="fx-preview__body">
          <div class="fx-preview__line">
            <span v-if="tagline">{{ tagline }}</span>
            <span v-else class="italic">missing</span>
          </div>

          <div class="fx-preview__meta">
            <span v-if="shortName" class="font-mono text-xs text-dimmed">@{{ shortName }}</span>
            <span v-if="id" class="font-mono text-xs text-dimmed break-all">{{ id }}</span>

            <UBadge
              v-if="typeof userCount === 'number'"
              variant="soft"
              color="neutral"
              size="xs"
              class="inline-flex items-center gap-1"
            >
              <UIcon name="i-lucide-users" class="size-3 shrink-0" />
              <span>{{ userCount }}</span>
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  id: { type: String, default: '' },
  shortName: { type: String, default: '' },

  avatarUrl: { type: String, default: '' },
  displayName: { type: String, default: '' },

  ecosystem: { type: String, default: '' },
  tagline: { type: String, default: '' },
  userCount: { type: Number as PropType<number | null>, default: null },
  badges: { type: Array as PropType<string[]>, default: () => [] },

  showSubtitle: { type: Boolean, default: true },
  showBadges: { type: Boolean, default: true },
  showBody: { type: Boolean, default: true },
})
</script>