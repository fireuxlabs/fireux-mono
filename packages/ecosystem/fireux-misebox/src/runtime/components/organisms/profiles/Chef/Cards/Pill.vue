<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-card fx-card--pill"
    @click="onClick"
  >
    <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ displayName }}</div>
      <div v-if="showSubtitle && tagline" class="min-w-0 truncate text-xs text-dimmed">
        {{ tagline }}
      </div>
    </div>

    <div v-if="showBadges && badges.length" class="ml-2 flex shrink-0 items-center gap-1">
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
  </component>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/useChef';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<ChefCard.Card, 'to' | 'avatarUrl' | 'displayName' | 'tagline' | 'badges'> & {
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
  }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
