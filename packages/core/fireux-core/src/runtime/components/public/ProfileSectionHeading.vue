<template>
  <div class="flex items-center gap-3">
    <div
      class="flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      :class="compact ? 'size-9' : 'size-10'"
    >
      <UIcon :name="icon" :class="compact ? 'size-4' : 'size-5'" />
    </div>
    <div class="min-w-0">
      <p class="fx-type-label">{{ eyebrow }}</p>
      <h2
        class="mt-0.5 font-semibold text-highlighted"
        :class="compact ? 'text-base' : 'text-xl'"
      >
        {{ title }}
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PublicProfileSectionHeading' })

withDefaults(
  defineProps<{
    compact?: boolean
    eyebrow: string
    icon: string
    title: string
  }>(),
  {
    compact: false,
  }
)
</script>
