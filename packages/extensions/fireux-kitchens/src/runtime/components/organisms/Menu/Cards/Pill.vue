<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <div class="flex w-full items-center justify-between gap-3">
      <UUser
        :name="title"
        :description="showSubtitle && subtitle ? subtitle : undefined"
        :avatar="imageUrl ? { src: imageUrl, alt: title } : undefined"
        size="sm"
        class="min-w-0"
      />
      <UChip :color="isActiveNow ? 'success' : 'error'" inset class="shrink-0" />
    </div>
  </component>
</template>

<script setup lang="ts">
import type { MenuCard } from '../../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface'

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
