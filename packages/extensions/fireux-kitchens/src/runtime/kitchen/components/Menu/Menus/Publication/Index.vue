<template>
  <section class="workspace-surface">
    <KitchenMenuMenusPublicationReadiness
      v-if="
        menu &&
        menu.schedule !== 'daily' &&
        menu.format !== 'document' &&
        !menu.doc?.url &&
        menu.status !== 'archived'
      "
    />
    <KitchenMenuMenusPublicationDaily v-if="menu?.schedule === 'daily'" />
    <KitchenMenuMenusPublicationActions v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu } = useKitchenMenuRecordContext()
</script>
