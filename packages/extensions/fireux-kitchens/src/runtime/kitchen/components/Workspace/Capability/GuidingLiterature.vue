<template>
  <AppOperationGuidingLiterature
    v-if="capabilityRecord"
    :operation="capabilityRecord"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { kitchenCapabilities } from '../../../models/capabilities'

const props = defineProps<{ capability: string }>()
const capabilityRecord = computed(() =>
  kitchenCapabilities.find((entry) => entry.slug === props.capability)
)
</script>
