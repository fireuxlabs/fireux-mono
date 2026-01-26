<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

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

        <div v-if="showSubtitle && tagline" class="preview__subtitle">
          {{ tagline }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div class="preview__line">
            <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
            <span v-else class="italic">missing</span>
          </div>

          <div class="preview__line text-dimmed">
            <span v-if="contactEmail">{{ contactEmail }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  avatarUrl: string
  displayName: string
  tagline: string
  badges: string[]
  bioShort: string
  contactEmail: string

  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
}

withDefaults(defineProps<Props>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  showBody: true,
})
</script>
