<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Bookings"
        description="Configure the inputs, then try the booking experience."
      />
      <UPageBody>
        <div class="booking-playground">
          <UPageCard
            title="Input"
            icon="i-lucide-sliders-horizontal"
            variant="subtle"
          >
            <BookingSandboxConfiguration v-model="configuration" />
          </UPageCard>
          <BookingsSurface :configuration="configuration" :confirm="confirm" />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const { configuration, confirm } = useBookingPreview()
definePageMeta({ layout: false })
useSeoMeta({ title: 'Bookings — FireUX Blank', robots: 'noindex, nofollow' })
</script>

<style scoped>
.booking-playground {
  display: grid;
  grid-template-columns: minmax(17rem, 1fr) minmax(0, 2fr);
  align-items: start;
  gap: calc(var(--spacing) * 8);
}
@media (max-width: 48rem) {
  .booking-playground {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
