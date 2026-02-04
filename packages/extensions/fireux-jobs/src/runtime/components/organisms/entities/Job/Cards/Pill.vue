<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/entities/Job/Cards/Pill.vue -->

<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
    class="pill"
  >
    <UUser
      :name="title"
      :description="kitchenName || undefined"
      :avatar="imageUrl ? { src: imageUrl, alt: title } : undefined"
      size="sm"
    />
  </component>
</template>

<script setup lang="ts">
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

type Props = Pick<JobCard.Card, 'to' | 'title'> & {
  /** Kitchen image (usually place image) */
  imageUrl?: string

  /** Kitchen display name */
  kitchenName?: string

  link?: boolean
  action?: boolean
}

const emit = defineEmits<{ (event: 'action'): void }>()

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  kitchenName: '',
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}
</script>