<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :description="showSubtitle ? (subtitle || undefined) : undefined"
      :avatar="imageUrl ? { src: imageUrl || undefined, alt: title || '' } : { icon: 'i-lucide-utensils', alt: title || '' }"
      size="sm"
    />
  </component>
</template>

<script setup lang="ts">
import type { DishCard } from '../../../../composables/fireux/firestore/dish/utils/view/useDishInterface'

type PillProps = Pick<DishCard.Card, 'to' | 'imageUrl' | 'title' | 'subtitle'> & {
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
