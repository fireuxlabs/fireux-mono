<template>
  <section v-if="items.length" aria-label="Project choices">
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
import type { Project } from '../../../models/project.model'

const props = defineProps<{ collection: readonly Project[]; selectedId: string }>()
const emit = defineEmits<{ select: [id: string] }>()
const items = computed(() => props.collection.filter((item) => Boolean(item.id)).map((item) => ({
  label: item.name || item.id,
  value: item.id,
  avatar: {
    src: item.image_url || undefined,
    alt: item.name,
    icon: 'i-lucide-briefcase-business',
  },
})))
</script>
