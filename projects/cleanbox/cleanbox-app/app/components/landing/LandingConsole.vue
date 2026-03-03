<template>
  <div v-if="hasConsoleEntry" class="landing-hero__actions">
    <UButton
      size="lg"
      variant="soft"
      color="neutral"
      :to="consoleEntryPath"
      icon="i-lucide-terminal"
    >
      {{ consoleEntryLabel }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'

const { hasConsoleEntry, consoleEntryPath, consoleEntryLabel } = useConsoleEntryCta()
</script>
