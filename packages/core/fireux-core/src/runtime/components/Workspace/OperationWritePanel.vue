<template>
  <MoleculesDisclosurePanel
    :title="title"
    :description="description"
    :default-open="defaultOpen"
  >
    <div class="mt-4">
      <slot />
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
// Workspace operation spine: tools marker, read surface, collapsed write lane.
withDefaults(defineProps<{
  title?: string
  description?: string
  defaultOpen?: boolean
}>(), {
  title: 'Actions',
  description: '',
  defaultOpen: false,
})
</script>
