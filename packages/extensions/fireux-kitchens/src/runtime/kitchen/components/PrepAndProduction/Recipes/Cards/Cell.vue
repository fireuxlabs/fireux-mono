<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="title"
        size="md"
        class="fx-card__badge"
      />
      <div v-else>
        <UIcon name="i-lucide-scroll-text" />
      </div>

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">
              {{ title }}
            </div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div class="card__badges">
            <UBadge
              v-if="showStatus && status"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ status }}
            </UBadge>
          </div>
        </div>

        <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else>No summary yet</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
type Props = {
  to: string
  title: string
  status: string
  badges: string[]
  avatarUrl?: string
  subtitle?: string
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showStatus?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  subtitle: '',
  prop: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  showStatus: true,
  showTagline: true,
  link: false,
  action: false,
})
</script>
