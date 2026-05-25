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
        <UAvatar :src="image || avatarUrl || undefined" :alt="displayName || ''" size="xs" />
      </template>

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
      :description="showSubtitle ? (title || undefined) : undefined"
      size="sm"
    >
      <template #avatar>
        <UAvatar :src="image || avatarUrl || undefined" :alt="displayName || ''" size="xs" />
      </template>

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

import type { ProfessionalCard } from '../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<ProfessionalCard.Card, 'to' | 'avatarUrl' | 'image' | 'displayName' | 'title'> & {
      badges?: string[]
      showSubtitle?: boolean
      showBadges?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    badges: () => [],
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
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
