<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="imageUrl || undefined" :alt="name" size="sm" />

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

        <div v-if="showSubtitle && subtitle" class="preview__subtitle">
          {{ subtitle }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div class="preview__line">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  imageUrl: string
  name: string
  subtitle: string
  badges: string[]
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
