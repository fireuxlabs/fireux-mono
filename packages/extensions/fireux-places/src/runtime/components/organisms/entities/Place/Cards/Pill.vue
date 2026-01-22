<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-card fx-card--pill cursor-pointer"
    @click="onClick"
  >
    <UAvatar
      :src="resolvedAvatarUrl || undefined"
      :alt="title"
      :style="resolvedAvatarUrl ? { backgroundColor: '#ffffff' } : undefined"
      size="xs"
      icon="i-lucide-image"
    />

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
import { computed } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

defineOptions({ inheritAttrs: false })

type PillProps = Pick<PlaceCard.Card, 'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'> & {
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

const resolvedAvatarUrl = computed(() => props.avatarUrl || '')

const onClick = () => {
  if (props.action) emit('action')
}
</script>
