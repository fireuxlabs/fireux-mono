<template>
  <pre>{{ JSON.stringify(document, null, 2) }}</pre>
</template>

<script setup lang="ts">
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'

const { document } = useKitchenItemContext()
</script>

<style scoped>
pre {
  overflow-x: auto;
}
</style>
