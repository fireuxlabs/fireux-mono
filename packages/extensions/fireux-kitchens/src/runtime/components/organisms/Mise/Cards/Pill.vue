<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :avatar="imageUrl ? { src: imageUrl, alt: title || '' } : { icon: 'i-lucide-clipboard-check', alt: title || '' }"
      size="sm"
    />
  </component>
</template>

<script setup lang="ts">
import type { MiseEnPlaceCard } from '../../../../composables/fireux/firestore/runtime-kitchen/mise/utils/view/useMiseEnPlaceInterface';

type PillProps = Pick<MiseEnPlaceCard.Card, 'to' | 'title' | 'imageUrl'> & {
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>
