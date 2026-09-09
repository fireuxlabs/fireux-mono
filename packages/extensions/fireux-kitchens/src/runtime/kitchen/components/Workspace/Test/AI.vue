<template>
  <TestAI :test="test" family="kitchen" label="Kitchen" endpoint="/api/workspace/kitchen/tests/intent" />
</template>
<script setup lang="ts">
import TestAI from 'fireux-core/runtime/components/Workspace/Test/AI.vue'
import type { TestController } from 'fireux-core/runtime/composables/fireux/useTest'
defineProps<{ test: TestController }>()
</script>
