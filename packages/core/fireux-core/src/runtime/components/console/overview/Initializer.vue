<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">{{ title }}</div>
        <p v-if="description" class="text-sm text-dimmed">
          {{ description }}
        </p>
      </div>
    </template>

    <slot name="actions">
      <div class="flex flex-wrap gap-3">
        <UButton
          v-if="primaryLabel && primaryTo"
          :to="primaryTo"
          color="primary"
          :icon="primaryIcon"
        >
          {{ primaryLabel }}
        </UButton>

        <UButton
          v-if="secondaryLabel && secondaryTo"
          :to="secondaryTo"
          variant="soft"
          color="neutral"
          :icon="secondaryIcon"
        >
          {{ secondaryLabel }}
        </UButton>
      </div>
    </slot>
  </UCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  primaryLabel?: string
  primaryTo?: string
  primaryIcon?: string
  secondaryLabel?: string
  secondaryTo?: string
  secondaryIcon?: string
}>(), {
  description: '',
  primaryLabel: '',
  primaryTo: '',
  primaryIcon: 'i-lucide-plus',
  secondaryLabel: '',
  secondaryTo: '',
  secondaryIcon: 'i-lucide-book-open',
})
</script>
