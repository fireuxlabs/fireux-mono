<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <div class="flex items-center gap-2">
      <UUser
        :name="title"
        :description="showSubtitle ? (subtitle || undefined) : undefined"
        :avatar="imageUrl ? { src: imageUrl, alt: title || '' } : { icon: 'i-lucide-book-open-check', alt: title || '' }"
        size="sm"
      />
      <div class="flex items-center gap-1 text-xs capitalize text-dimmed">
        <UChip :color="isActiveNow ? 'success' : 'error'" inset />
        <span>{{ isActiveNow ? 'active' : 'inactive' }}</span>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { MenuCard } from '../../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type PillProps = Pick<MenuCard.Card, 'to' | 'title' | 'subtitle' | 'imageUrl' | 'isActiveNow'> & {
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
