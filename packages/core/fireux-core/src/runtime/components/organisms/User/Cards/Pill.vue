<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="displayName"
      :avatar="
        proxiedAvatarUrl
          ? { src: proxiedAvatarUrl || undefined, alt: displayName || '' }
          : undefined
      "
      size="md"
    >
      <template #description>
        <div class="flex flex-col gap-1">
          <span v-if="showSubtitle">{{ handle }}</span>
          <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
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
      </template>
    </UUser>
  </component>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';
import { useAvatarProxy } from '../../../../composables/fireux/app/ui/useAvatarProxy'

type PillProps = Pick<
  UserCard.Card,
  'to' | 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'profiles'
> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  profiles: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(() => props.avatarUrl)

</script>
