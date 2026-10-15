<template>
  <section class="workspace-surface">
    <WorkspaceKitchenMenusPublicationDaily v-if="menu?.schedule === 'daily'" />
    <WorkspaceKitchenMenusPublicationActions v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu } = useKitchenMenuRecordContext()
</script>
