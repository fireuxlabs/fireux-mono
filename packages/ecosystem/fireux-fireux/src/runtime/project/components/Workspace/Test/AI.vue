<template>
  <TestAI :test="test" family="project" label="Project" endpoint="/api/workspace/project/tests/intent" />
</template>
<script setup lang="ts">
import TestAI from 'fireux-core/runtime/components/Workspace/Test/AI.vue'
import type { TestController } from 'fireux-core/runtime/composables/fireux/useTest'
defineProps<{ test: TestController }>()
</script>
