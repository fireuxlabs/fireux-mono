<template>
  <KitchenFoodAndDrinkMenusPreparation :kitchen-id="id" :source-id="uploadId" />
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const { id } = useKitchenWorkspace()
const uploadId = useRouteParam('uploadId')
</script>
