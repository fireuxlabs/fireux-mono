<template>
  <div class="space-y-4">
    <UCard>
      <div class="space-y-2">
        <h3 class="text-base font-semibold text-gray-900">
          App-level Professional Settings
        </h3>
        <p class="text-sm text-gray-500">
          There are currently no app-specific fields for the professional
          profile.
        </p>
        <p class="text-xs text-gray-400">
          This section is reserved for tenant-specific overrides when they are
          needed.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model'

defineProps<{
  professional: ProfessionalCore | null
}>()

// Placeholder component, ready for future tenant-specific overrides.
</script>
