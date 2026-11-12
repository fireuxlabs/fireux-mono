<template>
  <KitchenMenuMenusItemsEdit embedded />
</template>
<script setup lang="ts">
import { provideMenuSection } from '../../../../../menu/composables/useMenuSection'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const props = defineProps<{ sectionId: string }>()
provideMenuSection(useKitchenMenuRecordContext(), () => props.sectionId)
</script>
