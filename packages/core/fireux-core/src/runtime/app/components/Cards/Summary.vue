<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar
        :src="thumbnailUrl || undefined"
        :text="avatarText || undefined"
        :alt="name"
        size="sm"
      />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ name }}</div>

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

        <div v-if="showSubtitle && ecosystemId" class="preview__subtitle">
          {{ ecosystemId }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div class="preview__line">
            <span v-if="tagline">{{ tagline }}</span>
          </div>
          <div class="preview__meta">
            <span v-if="shortName">@{{ shortName }}</span>
            <span v-if="id" class="break-all">{{ id }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps({
  id: { type: String, default: '' },
  shortName: { type: String, default: '' },

  thumbnailUrl: { type: String, default: '' },
  avatarText: { type: String, default: '' },
  name: { type: String, default: '' },

  ecosystemId: { type: String, default: '' },
  tagline: { type: String, default: '' },
  badges: { type: Array as PropType<string[]>, default: () => [] },

  showSubtitle: { type: Boolean, default: true },
  showBadges: { type: Boolean, default: true },
  showBody: { type: Boolean, default: true },
})
</script>
