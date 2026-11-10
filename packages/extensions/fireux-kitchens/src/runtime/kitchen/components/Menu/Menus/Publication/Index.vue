<template>
  <section class="workspace-surface">
    <KitchenMenuMenusPublicationDaily v-if="menu?.schedule === 'daily'" />
    <KitchenMenuMenusPublicationActions v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu } = useKitchenMenuRecordContext()
</script>
