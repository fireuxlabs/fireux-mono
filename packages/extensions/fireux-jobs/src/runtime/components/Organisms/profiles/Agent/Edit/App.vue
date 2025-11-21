<template>
  <ClientOnly>
    <div v-if="agent" class="space-y-6">
      <UCard>
        <p class="text-sm opacity-70">
          App-specific agent settings are not available yet.
        </p>
      </UCard>
    </div>

    <MoleculesNotFound
      v-else
      entity="agent app profile"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import type { AgentProfile } from '../../../../../models/profiles/Agent.model.ts'

defineProps<{
  agent: Partial<AgentProfile> | null | undefined
}>()
</script>
