<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-highlighted">
          Create menu from a source
        </h2>
        <p class="text-sm text-dimmed">
          Upload menu photos or a PDF. The console will extract a raw read,
          clean it into a menu draft, then hold it for review before any dishes
          are created.
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

      <ConsoleKitchenOperationsMenusUpload
        title="Upload menu source"
        description="Use a clear menu name, such as main, lunch, or drinks. Multiple photos are fine."
        cta-label="Upload menu source"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
const steps = [
  {
    title: '1. Upload',
    description:
      'Add photos or a PDF of the menu. This creates a source upload only.',
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
