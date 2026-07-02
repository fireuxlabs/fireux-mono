<template>
  <OrderingIndex />
</template>

<script setup lang="ts">
import OrderingIndex from '../../components/Ordering/Index.vue'

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPage',
})

useSeoMeta({
  title: 'Online Ordering · Misebox',
  description:
    'Learn how Misebox turns menu baskets into delivery, takeaway, table ordering, catering, room service, and marketplace operations.',
})
</script>
