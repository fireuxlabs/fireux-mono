<template>
  <section class="workspace-surface">
    <KitchenWorkspaceMenuMenusPublicationReadiness
      v-if="
        menu &&
        menu.schedule !== 'daily' &&
        menu.format !== 'document' &&
        !menu.doc?.url &&
        menu.status !== 'archived'
      "
    />
    <KitchenWorkspaceMenuMenusPublicationDaily v-if="menu?.schedule === 'daily'" />
    <KitchenWorkspaceMenuMenusPublicationActions v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../../composables/workspace/menu/menus/useKitchenMenuRecordContext'
const { menu } = useKitchenMenuRecordContext()
</script>
