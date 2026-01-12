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

        <div v-if="showSubtitle && tagline" class="fx-preview__subtitle">
          {{ tagline }}
        </div>

        <div v-if="showBody" class="fx-preview__body">
          <div class="fx-preview__line">
            <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
            <span v-else class="italic">missing</span>
          </div>

          <div class="fx-preview__line text-dimmed">
            <span v-if="categoriesCsv">{{ categoriesCsv }}</span>
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
  categoriesCsv: string

  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
}

withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showBadges: true,
  showBody: true,
})
</script>
