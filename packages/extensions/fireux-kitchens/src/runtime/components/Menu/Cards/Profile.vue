<template>
  <UPageCard
    :title="$slots.actions ? undefined : title"
    :description="$slots.actions ? undefined : description"
    variant="subtle"
    class="border-primary/20 bg-primary/5"
  >
    <template v-if="$slots.actions" #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            {{ title }}
          </h2>
          <p v-if="description" class="mt-1 text-sm text-dimmed">
            {{ description }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <slot name="actions" />
        </div>
      </div>
    </template>

    <div v-if="capabilities.length">
      <p class="text-sm font-semibold text-highlighted">
        {{ capabilitiesTitle }}
      </p>

      <div class="mt-3 flex flex-wrap gap-2">
        <UBadge
          v-for="capability in capabilities"
          :key="capability"
          color="neutral"
          variant="soft"
        >
          {{ capability }}
        </UBadge>
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  capabilities?: string[]
  capabilitiesTitle?: string
}>(), {
  description: '',
  capabilities: () => [],
  capabilitiesTitle: 'Capabilities',
})
</script>
