<template>
  <div
    role="toolbar"
    :aria-label="`${label} record actions`"
    class="flex flex-wrap gap-2"
  >
    <WorkspaceCrudCreate
      :disabled="!availableSet.has('create')"
      @click="emit('create')"
    />
    <WorkspaceCrudRead
      :disabled="!availableSet.has('read')"
      @click="emit('read')"
    />
    <WorkspaceCrudUpdate
      :disabled="!availableSet.has('update')"
      @click="emit('update')"
    />
    <WorkspaceCrudDelete
      :disabled="!availableSet.has('delete')"
      @click="emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type WorkspaceCrudAction = 'create' | 'read' | 'update' | 'delete'

const props = withDefaults(
  defineProps<{
    label: string
    available?: WorkspaceCrudAction[]
  }>(),
  {
    available: () => [],
  }
)

const emit = defineEmits<{
  create: []
  read: []
  update: []
  delete: []
}>()

const availableSet = computed(() => new Set(props.available))
</script>
