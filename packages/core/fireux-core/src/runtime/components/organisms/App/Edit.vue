<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Edit.vue -->
<template>
  <OrganismsAppEditCore v-bind="props" />
</template>

<script setup lang="ts">
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

const props = defineProps<{ app: App }>()
</script>
