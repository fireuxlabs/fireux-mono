<template>
  <section class="space-y-4">
    <UTabs
      v-model="method"
      :items="methods"
      :content="false"
      aria-label="Create menu method"
    />
    <WorkspaceKitchenMenusCreateUpload
      v-if="method === 'upload'"
      cta-label="Upload"
    />
    <WorkspaceKitchenMenusCreateUrl v-else-if="method === 'url'" />
    <WorkspaceKitchenMenusCreateForm v-else />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const method = ref('upload')
const methods = [
  { label: 'PDF or photos', value: 'upload' },
  { label: 'Menu URL', value: 'url' },
  { label: 'Start blank', value: 'blank' },
]
</script>
