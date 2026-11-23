<template>
  <section v-if="items.length" aria-label="Kitchen choices">
    <UTabs
      :model-value="selectedId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      @update:model-value="emit('select', String($event))"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'

const props = defineProps<{
  collection: readonly Kitchen[]
  selectedId: string
}>()
const emit = defineEmits<{ select: [id: string] }>()
const items = computed(() =>
  props.collection
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      label: item.name,
      value: item.id,
    }))
)
</script>
