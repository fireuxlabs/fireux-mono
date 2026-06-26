<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-highlighted">
          Create menu from a source
        </h2>
        <p class="text-sm text-dimmed">
          Start from menu photos, a PDF, or an existing ordering URL. The
          console keeps the source first, then turns it into dishes after
          processing and review.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <ol class="grid gap-3 md:grid-cols-3">
        <li
          v-for="step in steps"
          :key="step.title"
          class="rounded-lg border border-default bg-muted/30 p-3"
        >
          <p class="text-sm font-medium text-highlighted">
            {{ step.title }}
          </p>
          <p class="mt-1 text-sm text-dimmed">
            {{ step.description }}
          </p>
        </li>
      </ol>

      <ConsoleKitchenOperationsMenusCreationUpload
        title="Upload menu source"
        description="Use a clear menu name, such as main, lunch, or drinks. Multiple photos are fine."
        cta-label="Upload menu source"
      />

      <ConsoleKitchenOperationsMenusCreationUrl />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const steps = [
  {
    title: '1. Add source',
    description:
      'Add photos, a PDF, or a live menu URL. This creates a source record only.',
  },
  {
    title: '2. Process',
    description: 'AI reads the source and creates a cleaned draft for review.',
  },
  {
    title: '3. Review',
    description:
      'Approve the draft before we create menu, section, and dish records.',
  },
]
</script>
