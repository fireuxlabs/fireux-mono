<template>
  <section class="console-surface space-y-4">
    <ConsolePortfolioOperationsPropertiesRead />
    <ConsolePortfolioOperationsPropertiesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleProperties } from '../../../../../composables/fireux/console/portfolio/operations/Properties/usePortfolioConsoleProperties'

const { canWrite } = usePortfolioConsoleProperties()
</script>
