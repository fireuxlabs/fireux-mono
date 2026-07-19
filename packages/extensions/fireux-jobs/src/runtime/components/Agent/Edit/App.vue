<template>
  <ClientOnly>
    <div v-if="agent" class="space-y-6">
      <UCard>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-highlighted">
            App-level Agent Settings
          </h3>
          <p class="text-sm text-muted">
            There are currently no app-specific fields for the agent profile.
          </p>
          <p class="text-xs text-dimmed">
            This section is reserved for tenant-specific overrides when they are needed.
          </p>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard
      v-else
      entity="agent app profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

const { appProfile } = useAgent()

const agent = computed(() => appProfile.value ?? null)
</script>
