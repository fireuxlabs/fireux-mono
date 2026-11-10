<template>
  <UPage>
    <UPageHeader title="Bookings" />
    <UPageBody>
      <div class="booking-playground">
        <section aria-labelledby="booking-input-title">
          <h2 id="booking-input-title">Input</h2>
          <BookingSandboxConfiguration v-model="configuration" />
        </section>
        <section aria-labelledby="booking-surface-title">
          <h2 id="booking-surface-title">Surface</h2>
          <BookingsSurface :configuration="configuration" :confirm="confirm" />
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const { configuration, confirm } = useBookingPreview()
definePageMeta({ layout: false })
useSeoMeta({ title: 'Bookings — FireUX Blank', robots: 'noindex, nofollow' })
</script>

<style scoped>
.booking-playground {
  display: grid;
  grid-template-columns: minmax(15rem, 1fr) minmax(0, 2fr);
  gap: calc(var(--spacing) * 8);
}
.booking-playground section {
  display: grid;
  align-content: start;
  gap: calc(var(--spacing) * 5);
  min-width: 0;
}
@media (max-width: 48rem) {
  .booking-playground {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
