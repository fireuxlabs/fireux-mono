<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <UBadge color="neutral" variant="soft">
          Identity
        </UBadge>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-toned">
          Operator
        </p>
        <h2 class="text-xl font-semibold text-highlighted">
          Is this your {{ entityLowerLabel }}?
        </h2>
        <p class="text-sm leading-6 text-muted">
          Manage your {{ entityLowerLabel }} from its console when you have
          operator access.
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  entityLabel: string
}>()

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'record').trim().toLowerCase()
)
</script>
