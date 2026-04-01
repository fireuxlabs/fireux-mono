<template>
  <UCard class="mx-auto max-w-6xl">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div class="space-y-4">
        <div class="space-y-1">
          <p v-if="readOnlyLabel" class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed">
            {{ readOnlyLabel }}
          </p>
          <h2 class="text-2xl font-semibold text-highlighted sm:text-3xl">
            {{ title }}
          </h2>
        </div>

        <slot name="readOnlyNote" />
        <slot name="readOnly" />

        <UButton
          v-if="learnMoreTo"
          :to="learnMoreTo"
          variant="soft"
          color="neutral"
          icon="i-lucide-book-open"
        >
          Learn more
        </UButton>
      </div>

      <div>
        <slot />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  consoleTo?: string
  readOnlyLabel?: string
  learnMoreTo?: string
}>()
</script>
