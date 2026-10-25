<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="card card--cell"
    @activate="emit('action')"
  >
    <div class="card__media">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        :text="avatarText || title"
        icon="i-lucide-orbit"
        size="md"
        class="shrink-0"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="card__subtitle">
              {{ subtitle }}
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
        </div>

        <div v-if="showMeta" class="card__tagline">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">

type EcosystemCellProps = {
  to?: string
  imageUrl?: string
  avatarText?: string
  title: string
  subtitle?: string
  meta?: string
  badges?: string[]
  showSubtitle?: boolean
  showMeta?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<EcosystemCellProps>(), {
  badges: () => [],
  showSubtitle: true,
  showMeta: true,
  showBadges: true,
  link: false,
  action: false,
})

</script>
