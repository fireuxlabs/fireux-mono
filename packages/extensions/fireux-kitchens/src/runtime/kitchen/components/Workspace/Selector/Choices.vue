<template>
  <section v-if="items.length" aria-label="Kitchen choices">
    <UTabs
      :model-value="selectedId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="emit('select', String($event))"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../models/kitchen-interface.model'

const props = defineProps<{ collection: readonly KitchenSurface[]; selectedId: string }>()
const emit = defineEmits<{ select: [id: string] }>()
const items = computed(() => props.collection.filter((item) => Boolean(item.id)).map((item) => ({
  label: item.display_name || item.id,
  value: item.id,
  avatar: {
    src: item.display_image_url || undefined,
    alt: item.display_name,
    icon: 'i-lucide-chef-hat',
  },
})))
</script>
