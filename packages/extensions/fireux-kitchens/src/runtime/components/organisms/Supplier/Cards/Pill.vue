<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :description="subtitle || undefined"
      :avatar="{ icon: 'i-lucide-store', alt: title || '' }"
      size="sm"
    />
  </component>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

type PillProps = Pick<SupplierCard.Card, 'to' | 'title' | 'subtitle'> & {
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
