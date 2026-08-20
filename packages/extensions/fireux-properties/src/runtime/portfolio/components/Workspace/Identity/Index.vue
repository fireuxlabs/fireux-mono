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
import { usePortfolioWorkspaceIdentity } from '../../../composables/workspace/identity/usePortfolioWorkspaceIdentity'

const { selectedPortfolio, canWrite } = usePortfolioWorkspaceIdentity()
</script>
