<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    :disabled="disabled"
    class="pill"
    @activate="emit('action')"
  >
    <div class="card__media fx-card__media--start">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        icon="i-lucide-folders"
        size="sm"
      />

      <div class="card__content card__stack">
        <p class="card__title">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="card__subtitle">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && (badges?.length ?? 0)" class="card__badges">
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
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
type ProjectPillProps = {
  to?: string
  imageUrl?: string
  title: string
  subtitle?: string
  badges?: string[]
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<ProjectPillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
  disabled: false,
})
</script>
