<template>
  <section class="console-surface space-y-6">
    <PortfolioIdentityRead />

    <PortfolioIdentityWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIdentity } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsoleIdentity'

const { canWrite } = usePortfolioConsoleIdentity()
</script>
