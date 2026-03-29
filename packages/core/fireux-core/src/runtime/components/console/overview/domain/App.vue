<template>
  <UPageCard variant="subtle">
    <div class="space-y-3">
      <p class="text-sm text-dimmed font-medium">
        {{ fireux.appId }} — app overview
      </p>
      <p class="text-sm text-dimmed leading-relaxed">
        {{ fireux.appName }} is currently running as a {{ fireux.role }} app in the
        {{ fireux.ecosystem }} ecosystem. This panel is the generic fallback for
        app-specific overview notes.
      </p>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'

const fireux = useFireUXConfig()
</script>
