<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <div class="space-y-1">
      <UUser
        :name="title"
        :description="subtitle || undefined"
        :avatar="imageUrl ? { src: imageUrl, alt: title || '' } : { icon: 'i-lucide-carrot', alt: title || '' }"
        size="sm"
      />
      <UChip
        v-if="warning"
        color="warning"
        variant="soft"
        size="xs"
      >
        {{ warning }}
      </UChip>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { IngredientCard } from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'

type PillProps = Pick<IngredientCard.Card, 'to' | 'title' | 'subtitle' | 'imageUrl'> & {
  link?: boolean
  action?: boolean
  warning?: string
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
