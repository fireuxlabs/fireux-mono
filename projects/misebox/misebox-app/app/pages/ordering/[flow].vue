<template>
  <OrderingDetail :flow="flow" />
</template>

<script setup lang="ts">
import OrderingDetail from '../../components/Ordering/Detail.vue'
import { isOrderingPageKey } from '../../utils/orderingPages'

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingFlowPage',
})

const route = useRoute()
const slug = String(route.params.flow || '')

if (!isOrderingPageKey(slug)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Ordering flow not found',
  })
}

const flow = slug
</script>
