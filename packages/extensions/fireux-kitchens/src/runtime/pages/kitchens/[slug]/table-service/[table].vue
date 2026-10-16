<template>
  <KitchenDetailServiceMenu
    :kitchen-slug="kitchenSlug"
    service="table"
    :table-number="tableNumber"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { tableServiceTableNumber } from '../../../../menu/utils/table-service'
definePageMeta({
  name: 'KitchenTableServiceMenuPage',
  title: 'At your table',
  validate: (route) => Boolean(tableServiceTableNumber(route.params.table)),
})
const kitchenSlug = useRouteParam('slug')
const table = useRouteParam('table')
const tableNumber = computed(() => tableServiceTableNumber(table.value))
</script>
