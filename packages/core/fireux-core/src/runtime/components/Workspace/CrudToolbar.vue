<template>
  <div
    role="toolbar"
    :aria-label="`${label} record actions`"
    class="flex flex-wrap gap-2"
  >
    <WorkspaceCrudCreate
      v-if="actions.includes('create')"
      :disabled="!availableSet.has('create')"
      @click="emit('create')"
    />
    <WorkspaceCrudRead
      v-if="actions.includes('read')"
      :disabled="!availableSet.has('read')"
      @click="emit('read')"
    />
    <WorkspaceCrudUpdate
      v-if="actions.includes('update')"
      :disabled="!availableSet.has('update')"
      @click="emit('update')"
    />
    <WorkspaceCrudDelete
      v-if="actions.includes('delete')"
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
    actions?: WorkspaceCrudAction[]
  }>(),
  {
    available: () => [],
    actions: () => ['create', 'read', 'update', 'delete'],
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
