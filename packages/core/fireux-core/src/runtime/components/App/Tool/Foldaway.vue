<template>
  <UCard
    variant="subtle"
    class="w-full"
  >
    <details :open="open">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
        <span class="space-y-1">
          <span class="block text-base font-semibold text-highlighted">
            {{ title }}
          </span>
          <span
            v-if="description"
            class="block text-sm font-normal text-muted"
          >
            {{ description }}
          </span>
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <UBadge
            v-if="provider"
            :label="provider"
            color="neutral"
            variant="soft"
          />
          <UIcon name="i-lucide-chevron-down" class="size-4 text-muted" />
        </span>
      </summary>

      <div class="mt-4">
        <slot />
      </div>
    </details>
  </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  provider?: string
  open?: boolean
}>(), {
  description: '',
  provider: '',
  open: false,
})
</script>
