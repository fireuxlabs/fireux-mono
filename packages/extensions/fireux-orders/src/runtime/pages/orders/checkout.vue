<template>
  <OrderCheckoutSystem />
</template>

<script setup lang="ts">
import OrderCheckoutSystem from '../../components/organisms/Order/Checkout/System.vue'

definePageMeta({
  layout: 'default',
  title: 'Basket & Checkout',
  description: 'Review your basket and submit your order.',
  head: { title: 'Basket & Checkout' },
  name: 'OrdersCheckoutPage',
})
</script>
