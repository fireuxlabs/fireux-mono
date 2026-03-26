<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="pill"
>
    <UUser
      :name="displayName"
      :description="showSubtitle ? (title || undefined) : undefined"
      size="sm"
    >
      <template #avatar>
        <UAvatarGroup v-if="avatarUrl && secondaryAvatarUrl" size="xs">
          <UAvatar :src="avatarUrl || undefined" :alt="displayName || ''" size="xs" />
          <UAvatar :src="secondaryAvatarUrl || undefined" :alt="displayName || ''" size="2xs" />
        </UAvatarGroup>
        <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName || ''" size="xs" />
      </template>

      <template #default>
        <div v-if="showBadges && (badges?.length ?? 0)" class="flex flex-wrap items-center gap-1">
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
      </template>
    </UUser>
</NuxtLink>

<div
  v-else
  class="pill"
  @click="onClick"
>
    <UUser
      :name="displayName"
      :description="showSubtitle ? (title || undefined) : undefined"
      size="sm"
    >
      <template #avatar>
        <UAvatarGroup v-if="avatarUrl && secondaryAvatarUrl" size="xs">
          <UAvatar :src="avatarUrl || undefined" :alt="displayName || ''" size="xs" />
          <UAvatar :src="secondaryAvatarUrl || undefined" :alt="displayName || ''" size="2xs" />
        </UAvatarGroup>
        <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName || ''" size="xs" />
      </template>

      <template #default>
        <div v-if="showBadges && (badges?.length ?? 0)" class="flex flex-wrap items-center gap-1">
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
      </template>
    </UUser>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<AgentCard.Card, 'to' | 'avatarUrl' | 'secondaryAvatarUrl' | 'displayName' | 'title' | 'badges'> & {
      showSubtitle?: boolean
      showBadges?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
    badges: () => [],
  }
)

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
