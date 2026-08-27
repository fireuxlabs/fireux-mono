<template>
  <AppOperationGuidingLiterature v-if="operation" :operation="operation" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { kitchenOperations } from '../../../models/operations'

const props = defineProps<{ operation: string }>()
const operation = computed(() =>
  kitchenOperations.find((entry) => entry.slug === props.operation)
)
</script>
