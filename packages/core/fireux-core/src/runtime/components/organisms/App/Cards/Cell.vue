<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl" :alt="displayName" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ displayName }}</div>
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

        <div v-if="showTagline && tagline" class="fx-cell__tagline">
          {{ tagline }}
        </div>

        <div v-if="showMeta" class="fx-cell__meta">
          <UBadge
            v-if="userCount !== null"
            variant="soft"
            color="neutral"
            size="xs"
            class="inline-flex items-center gap-1"
          >
            <UIcon name="i-lucide-users" class="size-3 shrink-0" />
            <span class="truncate">{{ userCount }}</span>
          </UBadge>
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
  badges?: string[]
  tagline?: string
  userCount?: number | null
  showBadges?: boolean
  showTagline?: boolean
  showMeta?: boolean
}

withDefaults(defineProps<Props>(), {
  badges: () => [],
  userCount: null,
  showBadges: true,
  showTagline: true,
  showMeta: true,
})
</script>