<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="avatarUrl || undefined" :alt="title" size="sm" icon="i-lucide-briefcase" />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ title }}</div>

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

        <div v-if="subtitle" class="preview__subtitle">
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
  avatarUrl: string
  title: string
  subtitle: string
  badges: string[]
  prop?: string
  showBadges?: boolean
  showBody?: boolean
}

withDefaults(defineProps<Props>(), {
  badges: () => [],
  showBadges: true,
  showBody: true,
})
</script>
