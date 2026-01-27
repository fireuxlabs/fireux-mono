<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatarGroup v-if="secondaryAvatarUrl" size="sm">
        <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />
        <UAvatar :src="secondaryAvatarUrl || undefined" :alt="displayName" size="2xs" />
      </UAvatarGroup>
      <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
          </div>

          <div v-if="badges.length" class="card__badges">
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

        <div v-if="showSubtitle && tagline" class="card__subtitle">
          {{ tagline }}
        </div>

        <div class="card__tagline">
          <span v-if="prop || bioShort">{{ prop || bioShort }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface';

type Props = Pick<
  AgentCard.Card,
  'to'
  | 'avatarUrl'
  | 'secondaryAvatarUrl'
  | 'displayName'
  | 'tagline'
  | 'badges'
  | 'bioShort'
> & {
  prop?: string
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  badges: () => [],
  showSubtitle: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
