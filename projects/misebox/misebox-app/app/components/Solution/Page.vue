<template>
  <UPage>
        <UButton to="/solutions" variant="link"> Solutions </UButton>
        <UPageHeader
          :title="solution.title"
          :description="solution.description"
        />
        <UPageBody>
          <div class="pagebody">
            <slot />
          </div>
        </UPageBody>
      </UPage>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  solution: Pick<MiseboxSolution, 'title' | 'description'>
}>()
</script>
