<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="thumbnailUrl || undefined" :alt="displayName" size="sm" />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ displayName }}</div>

          <div v-if="showBadges && badges.length" class="preview__badges">
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

        <div v-if="showSubtitle && ecosystem" class="preview__subtitle">
          {{ ecosystem }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div class="preview__line">
            <span v-if="tagline">{{ tagline }}</span>
            <span v-else class="italic">missing</span>
          </div>

          <div class="preview__meta">
            <span v-if="shortName" class="font-mono text-xs text-dimmed">@{{ shortName }}</span>
            <span v-if="id" class="font-mono text-xs text-dimmed break-all">{{ id }}</span>

            <MoleculesMetricBadge
              v-if="typeof userCount === 'number'"
              icon="i-lucide-users"
              :value="userCount"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

defineOptions({ inheritAttrs: false })

defineProps({
  id: { type: String, default: '' },
  shortName: { type: String, default: '' },

  thumbnailUrl: { type: String, default: '' },
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