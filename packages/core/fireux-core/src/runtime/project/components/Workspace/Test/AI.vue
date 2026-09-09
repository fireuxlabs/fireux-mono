<template>
  <TestAI :test="test" family="project" label="Project" endpoint="/api/workspace/project/tests/intent" />
</template>
<script setup lang="ts">
import TestAI from '../../../../components/Workspace/Test/AI.vue'
import type { TestController } from '../../../../composables/fireux/useTest'
defineProps<{ test: TestController }>()
</script>
