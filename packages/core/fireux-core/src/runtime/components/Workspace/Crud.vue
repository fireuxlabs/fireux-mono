<template>
  <div>
    <WorkspaceCrudToolbar
      :label="label"
      :available="available"
      @create="open.create = true"
      @read="open.read = true"
      @update="open.update = true"
      @delete="open.delete = true"
    />

    <slot
      name="create"
      :open="open.create"
      :set-open="(value: boolean) => (open.create = value)"
    />
    <slot
      name="read"
      :open="open.read"
      :set-open="(value: boolean) => (open.read = value)"
    />
    <slot
      name="update"
      :open="open.update"
      :set-open="(value: boolean) => (open.update = value)"
    />
    <slot
      name="delete"
      :open="open.delete"
      :set-open="(value: boolean) => (open.delete = value)"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { WorkspaceCrudAction } from './CrudToolbar.vue'

defineProps<{
  label: string
  available: WorkspaceCrudAction[]
}>()

const open = reactive<Record<WorkspaceCrudAction, boolean>>({
  create: false,
  read: false,
  update: false,
  delete: false,
})
</script>
