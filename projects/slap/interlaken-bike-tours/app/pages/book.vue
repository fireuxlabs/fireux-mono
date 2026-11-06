<template>
  <Booking />
</template>
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'tour-booking',
    label: 'Book a tour',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>
