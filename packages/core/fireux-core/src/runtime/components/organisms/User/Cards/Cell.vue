<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar :src="avatarUrl" :alt="displayName" size="sm" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && handle" class="card__subtitle">
              {{ handle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="subtle"
              color="secondary"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else-if="profiles.length && appsLabel">{{ profiles.join(', ') }} · {{ appsLabel }}</span>
          <span v-else-if="profiles.length">{{ profiles.join(', ') }}</span>
          <span v-else-if="appsLabel">{{ appsLabel }}</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

type Props = Pick<
  UserCard.Card,
  'to' | 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'profiles' | 'appsLabel'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<Props>(),
  {
    avatarUrl: '',
    displayName: '',
    handle: '',
    badges: () => [],
    profiles: () => [],
    appsLabel: '',

    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    link: false,
    action: false,
  }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
