<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="displayName"
      :description="showSubtitle ? (tagline || undefined) : undefined"
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
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<AgentCard.Card, 'to' | 'avatarUrl' | 'secondaryAvatarUrl' | 'displayName' | 'tagline' | 'badges'> & {
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

const onClick = () => {
  if (props.action) emit('action')
}
</script>
