<template>
  <section class="workspace-surface">
    <KitchenFoodAndDrinkMenusPublicationDaily v-if="menu?.schedule === 'daily'" />
    <KitchenFoodAndDrinkMenusPublicationActions v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu } = useKitchenMenuRecordContext()
</script>
