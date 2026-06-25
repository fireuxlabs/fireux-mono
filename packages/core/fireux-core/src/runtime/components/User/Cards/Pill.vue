<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="pill"
>
    <UUser
      :name="displayName"
      :description="showSubtitle ? (handle || undefined) : undefined"
      :avatar="
        proxiedAvatarUrl
          ? { src: proxiedAvatarUrl || undefined, alt: displayName || '' }
          : undefined
      "
      size="sm"
    >
      <template #default>
        <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
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
      :description="showSubtitle ? (handle || undefined) : undefined"
      :avatar="
        proxiedAvatarUrl
          ? { src: proxiedAvatarUrl || undefined, alt: displayName || '' }
          : undefined
      "
      size="sm"
    >
      <template #default>
        <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
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

import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy';
import type { UserCard } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';

type PillProps = Partial<Pick<
  UserCard.Card,
  'to' | 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'profiles'
>> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  to: '',
  avatarUrl: '',
  displayName: '',
  handle: '',
  badges: () => [],
  profiles: () => [],
  showSubtitle: true,
  showBadges: true,
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

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(() => props.avatarUrl)
</script>
