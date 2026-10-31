<template>
  <div class="workspace-surface">
    <KitchenFoodAndDrinkMenusDetailIdentity v-if="menu" />
    <h1 v-else class="fx-type-page-title">
      {{ menuLabel }}
    </h1>
    <KitchenFoodAndDrinkMenusDetailNavigation v-if="menu" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'

const { menu, source } = useKitchenMenuRecordContext()
const menuLabel = computed(() =>
  String(
    menu.value?.internal_name || menu.value?.name || source.value?.id || 'Menu'
  ).trim()
)
</script>
