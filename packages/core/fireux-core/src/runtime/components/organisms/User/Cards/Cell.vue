<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl" :alt="displayName" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ displayName }}</div>
            <div v-if="showSubtitle && handle" class="fx-cell__subtitle">
              {{ handle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-cell__badges">
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

        <div v-if="showTagline" class="fx-cell__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else-if="profiles.length && appsLabel">{{ profiles.join(', ') }} · {{ appsLabel }}</span>
          <span v-else-if="profiles.length">{{ profiles.join(', ') }}</span>
          <span v-else-if="appsLabel">{{ appsLabel }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
type Props = {
  to: string
  avatarUrl: string
  displayName: string
  handle: string
  badges: string[]
  profiles: string[]
  appsLabel: string

  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
}

withDefaults(
  defineProps<Props>(),
  {
    showSubtitle: true,
    showBadges: true,
    showTagline: true,
  }
)
</script>
