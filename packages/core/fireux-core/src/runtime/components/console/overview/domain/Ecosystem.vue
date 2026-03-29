<template>
  <UPageCard variant="subtle">
    <div class="space-y-3">
      <p class="text-sm text-dimmed font-medium">
        {{ fireux.ecosystem }} — ecosystem overview
      </p>
      <p class="text-sm text-dimmed leading-relaxed">
        This app belongs to the {{ fireux.ecosystem }} ecosystem. Use this panel
        for ecosystem-wide notes, shared module expectations, and cross-app
        operating context when no app-specific ecosystem card is defined yet.
      </p>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'

const fireux = useFireUXConfig()
</script>
