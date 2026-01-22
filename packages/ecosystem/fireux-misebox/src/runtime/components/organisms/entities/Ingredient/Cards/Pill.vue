<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-card fx-card--pill"
    @click="onClick"
  >
    <UAvatar :src="avatarUrl || undefined" :alt="title" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ title }}</div>
      <div v-if="showSubtitle && subtitle" class="min-w-0 truncate text-xs text-dimmed">
        {{ subtitle }}
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
import type { IngredientCard } from '../../../../../composables/fireux/firestore/objects/ingredient/utils/view/useIngredientInterface';

type PillProps = Pick<IngredientCard.Card, 'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
