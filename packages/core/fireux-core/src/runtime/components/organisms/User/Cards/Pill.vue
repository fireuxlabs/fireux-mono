<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="displayName"
      :description="showSubtitle ? (subtitleText || undefined) : undefined"
      :avatar="avatarUrl ? { src: avatarUrl || undefined, alt: displayName || '' } : undefined"
      size="sm"
    >
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
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';

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

const subtitleText = computed(() => {
  const parts: string[] = []
  if (props.handle) parts.push(props.handle)
  if (props.profiles.length) parts.push(props.profiles.join(', '))
  return parts.join(' · ')
})

const onClick = () => {
  if (props.action) emit('action')
}

</script>
