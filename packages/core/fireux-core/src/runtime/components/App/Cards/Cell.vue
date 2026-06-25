<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="card card--cell"
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="tagline">{{ tagline }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="card card--cell"
    @click="onClick"
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="tagline">{{ tagline }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { AppCard } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

defineOptions({ inheritAttrs: false })

type Props = Partial<Omit<
  Pick<
    AppCard.Card,
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

const props = withDefaults(defineProps<Props>(), {
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

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return

  navigateTo(props.to)
}
</script>
