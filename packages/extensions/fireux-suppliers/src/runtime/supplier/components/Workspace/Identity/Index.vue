<template>
  <section class="workspace-surface">
    <WorkspaceSupplierIdentityRead />

    <ClientOnly>
      <div
        v-if="selectedSupplier && canWrite"
        class="workspace-profile__section"
      >
        <WorkspaceSupplierIdentityEdit />
      </div>
    </ClientOnly>
  </section>
</template>

<script setup lang="ts">
import { useSupplierWorkspaceIdentity } from '../../../composables/workspace/identity/useSupplierWorkspaceIdentity'

const { selectedSupplier, canWrite } = useSupplierWorkspaceIdentity()
</script>
