<template>
  <ClientOnly>
    <div v-if="professional" class="space-y-6">
      <UCard>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-highlighted">
            App-level Professional Settings
          </h3>
          <p class="text-sm text-muted">
            There are currently no app-specific fields for the professional profile.
          </p>
          <p class="text-xs text-dimmed">
            This section is reserved for tenant-specific overrides when they are needed.
          </p>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="professional app profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Professional } from '../../../models/profiles/Professional/Professional.model';

defineProps<{
  professional: Professional | null
}>()
</script>
