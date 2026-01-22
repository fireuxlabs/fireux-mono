<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-cell"
    @click="onClick"
  >
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
