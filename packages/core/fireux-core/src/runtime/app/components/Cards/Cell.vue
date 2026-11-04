<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="card card--cell"
    @activate="emit('action')"
  >
    <div class="card__media">
      <UAvatar
        :src="thumbnailUrl || undefined"
        :text="avatarText || undefined"
        :alt="name"
        size="md"
        class="shrink-0"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ name }}</div>
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

        <div v-if="showTagline && tagline" class="card__tagline">
          <span v-if="tagline">{{ tagline }}</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { AppCard } from '../../composables/useAppView'

defineOptions({ inheritAttrs: false })

type Props = Partial<
  Pick<AppCard, 'to' | 'thumbnailUrl' | 'avatarText' | 'name' | 'badges' | 'tagline'>
> & {
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  to: '',
  thumbnailUrl: '',
  name: '',
  badges: () => [],
  tagline: '',
  avatarText: '',
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
})

</script>
