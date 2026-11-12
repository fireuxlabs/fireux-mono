<template>
  <UPage>
    <UPageHeader
      title="Book your private tour"
      description="Choose your ride, date and group. Then select your departure and confirm your details."
    />
    <UPageBody>
      <div class="tour-booking">
        <BookingOptions
          v-model:tour-slug="tourSlug"
          v-model:date="date"
          v-model:group-size="groupSize"
          :minimum-date="minimumDate"
          :unit-price="tour.price"
          :duration="tour.duration"
          :total="total"
        />
        <section class="tour-booking__surface" aria-label="Tour booking">
          <p role="status">{{ message }}</p>
          <BookingsSurface :configuration="configuration" :confirm="confirm" />
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import BookingsSurface from 'fireux-bookings/runtime/components/Surface.vue'
const {
  tourSlug,
  date,
  groupSize,
  tour,
  minimumDate,
  total,
  message,
  configuration,
  confirm,
} = useTourBooking()
</script>
<style scoped>
.tour-booking {
  display: grid;
  grid-template-columns: minmax(17rem, 1fr) minmax(0, 2fr);
  align-items: start;
  gap: calc(var(--spacing) * 6);
}
.tour-booking__surface {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
@media (max-width: 48rem) {
  .tour-booking {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
