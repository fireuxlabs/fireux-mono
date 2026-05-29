<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolBookingLink class="w-full max-w-xl" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'booking-link',
  title: 'Booking link',
  description: 'Create a QR code that opens a booking or appointment link.',
  badge: 'Coming soon',
}

useSeoMeta({
  title: 'Booking link - Go QR',
  description: solution.description,
})
</script>
