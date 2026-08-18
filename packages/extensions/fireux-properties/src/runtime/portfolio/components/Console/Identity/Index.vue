<template>
  <section class="console-surface">
    <ConsolePortfolioIdentityRead />

    <ClientOnly>
      <div
        v-if="selectedPortfolio && canWrite"
        class="console-profile__section"
      >
        <ConsolePortfolioIdentityEdit />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleIdentity } from '../../../composables/console/identity/usePortfolioConsoleIdentity'

const { selectedPortfolio, canWrite } = usePortfolioConsoleIdentity()
</script>
