<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="card card--cell"
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
            <div v-if="showSubtitle && title" class="card__subtitle">
              {{ title }}
            </div>
          </div>

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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop || summary">{{ prop || summary }}</span>
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
      <UAvatarGroup v-if="secondaryAvatarUrl" size="sm">
        <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />
        <UAvatar :src="secondaryAvatarUrl || undefined" :alt="displayName" size="2xs" />
      </UAvatarGroup>
      <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && title" class="card__subtitle">
              {{ title }}
            </div>
          </div>

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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop || summary">{{ prop || summary }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface';

type Props = Pick<
  ChefCard.Card,
  'to' | 'avatarUrl' | 'secondaryAvatarUrl' | 'displayName' | 'title' | 'badges' | 'summary'
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

const props = withDefaults(defineProps<Props>(), {
  title: '',
  secondaryAvatarUrl: undefined,
  badges: () => [],
  summary: '',
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
})

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
