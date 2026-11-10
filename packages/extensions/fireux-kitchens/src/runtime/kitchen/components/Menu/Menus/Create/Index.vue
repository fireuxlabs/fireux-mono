<template>
  <section class="workspace-surface workspace-surface--compact">
    <UTabs
      v-model="method"
      :items="methods"
      :content="false"
      aria-label="Create menu method"
    />
    <KitchenMenuMenusCreateUpload
      v-if="method === 'upload'"
      cta-label="Upload"
    />
    <KitchenMenuMenusCreateUrl v-else-if="method === 'url'" />
    <KitchenMenuMenusCreateForm v-else />
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
