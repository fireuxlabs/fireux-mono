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
import { projectIdentityMedia } from '../../../utils/project-identity-media'
import type { ProjectPublishedIdentity } from '../../../models/published-identity'
import type { Project } from '../../../models/project.model'

const props = defineProps<{
  collection: readonly Project[]
  selectedId: string
  publication?: ProjectPublishedIdentity | null
}>()
const emit = defineEmits<{ select: [id: string] }>()
const items = computed(() =>
  props.collection
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      label: item.identity.name || item.id,
      value: item.id,
      avatar: {
        src:
          projectIdentityMedia(item, props.publication).imageUrl || undefined,
        ui:
          projectIdentityMedia(item, props.publication).imageFit === 'contain'
            ? { image: 'object-contain p-1' }
            : undefined,
        alt: item.identity.name,
        icon: 'i-lucide-briefcase-business',
      },
    }))
)
</script>
