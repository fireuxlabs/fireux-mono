<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the FireUX authored solution-page shell. -->
<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/solutions" variant="link" class="px-0">
          Solutions
        </UButton>
        <UPageHeader
          :title="title"
          :description="description"
          headline="FireUX solution"
        />
        <UPageBody class="space-y-4">
          <div class="space-y-8">
            <slot />
          </div>

          <div class="flex flex-wrap gap-3">
            <slot name="actions" />
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
