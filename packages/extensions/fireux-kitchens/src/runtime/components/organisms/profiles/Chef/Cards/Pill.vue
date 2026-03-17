<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
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
  </component>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<{
    to: string
    avatarUrl: string
    displayName: string
    title: string
    secondaryAvatarUrl?: string
    badges?: string[]
    showSubtitle?: boolean
    showBadges?: boolean
    link?: boolean
    action?: boolean
  }>(),
  {
    secondaryAvatarUrl: undefined,
    badges: () => [],
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
  }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
