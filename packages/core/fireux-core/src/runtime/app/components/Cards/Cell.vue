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
        :alt="displayName"
        size="md"
        class="shrink-0"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
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

        <div v-if="showMeta && userCount !== null" class="card__subtitle">
          {{ userCount }} users
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

type Props = Partial<Omit<
  Pick<
    AppCard,
    | 'to'
    | 'thumbnailUrl'
    | 'avatarText'
    | 'displayName'
    | 'badges'
    | 'tagline'
    | 'userCount'
  >,
  'userCount'
>> & {
  userCount?: number | null

  showBadges?: boolean
  showTagline?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  to: '',
  thumbnailUrl: '',
  displayName: '',
  badges: () => [],
  tagline: '',
  avatarText: '',
  userCount: null,
  showBadges: true,
  showTagline: true,
  showMeta: true,
  link: false,
  action: false,
})

</script>
