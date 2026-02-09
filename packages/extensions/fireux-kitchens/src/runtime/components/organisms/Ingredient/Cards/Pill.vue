<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :avatar="imageUrl ? { src: imageUrl, alt: title || '' } : { icon: 'i-lucide-carrot', alt: title || '' }"
      size="sm"
    />
  </component>
</template>

<script setup lang="ts">
import type { IngredientCard } from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

type PillProps = Pick<IngredientCard.Card, 'to' | 'title' | 'imageUrl'> & {
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
