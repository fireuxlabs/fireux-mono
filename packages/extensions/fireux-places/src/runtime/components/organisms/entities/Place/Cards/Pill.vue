<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-card fx-card--pill cursor-pointer"
    @click="onClick"
  >
    <span :style="avatarShadeStyle" class="fx-pill__avatar">
      <img
        v-if="resolvedAvatarUrl"
        :src="resolvedAvatarUrl"
        :alt="title"
        class="h-4 w-4 object-contain"
      />
      <i v-else class="i-lucide-image text-xs" />
    </span>

    <div class="fx-card__content fx-card__stack">
      <div class="fx-card__title">{{ title }}</div>
      <div v-if="showSubtitle && subtitle" class="fx-card__subtitle">
        {{ subtitle }}
      </div>
    </div>

    <div v-if="showBadges && badges.length" class="fx-card__badges ml-2 shrink-0">
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

type PillProps = Pick<
  PlaceCard.Card,
  'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges' | 'imageShade'
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
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const resolvedAvatarUrl = computed(() => props.avatarUrl || '')
const avatarShadeStyle = computed(() => {
  const base =
    'display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 9999px;'
  const shade = props.imageShade
  if (!shade) return base
  const bg =
    shade === 'light'
      ? '#111827'
      : shade === 'dark'
        ? '#ffffff'
        : '#f5f5f5'
  return `${base} background-color: ${bg}; border: 1px solid var(--ui-border);`
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
