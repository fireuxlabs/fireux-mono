<template>
  <section class="workspace-surface">
    <WorkspacePortfolioIdentityRead />

    <ClientOnly>
      <div
        v-if="selectedPortfolio && canWrite"
        class="workspace-profile__section"
      >
        <WorkspacePortfolioIdentityEdit />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioIdentity } from '../../../composables/usePortfolioIdentity'

const { selectedPortfolio, canWrite } = usePortfolioIdentity()
</script>
