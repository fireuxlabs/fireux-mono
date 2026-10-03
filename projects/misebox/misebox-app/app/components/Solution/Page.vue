<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/solutions" variant="link" class="px-0">
          Solutions
        </UButton>
        <UPageHeader
          :title="solution.title"
          :description="solution.description"
        />
        <UPageBody class="space-y-4">
          <div class="space-y-8">
            <slot />
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  solution: Pick<MiseboxSolution, 'title' | 'description'>
}>()
</script>
