<template>
  <TestAI :test="test" family="kitchen" label="Kitchen" endpoint="/api/workspace/kitchen/tests/intent" />
</template>
<script setup lang="ts">
import TestAI from 'fireux-core/runtime/workspace/components/Test/AI.vue'
import type { TestController } from 'fireux-core/runtime/workspace/composables/useWorkspaceTest'
defineProps<{ test: TestController }>()
</script>
