<template>
  <section aria-labelledby="item-document-heading">
    <h2 id="item-document-heading">Item document</h2>
    <pre>{{ JSON.stringify(document, null, 2) }}</pre>
  </section>
</template>

<script setup lang="ts">
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'

const { document } = useKitchenItemContext()
</script>
