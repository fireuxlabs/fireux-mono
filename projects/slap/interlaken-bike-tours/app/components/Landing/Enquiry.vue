<template>
  <UPageSection
    id="contact"
    title="Your next good day starts here."
    description="Tell Ben your dates, group size and what you’d like to see. Looking for a ride today? Ask about same-day availability."
    orientation="horizontal"
  >
    <UCard id="enquire">
      <form
        class="tour-enquiry-form"
        @submit.prevent="
          navigateTo(enquiryUrl(message), {
            external: true,
            open: { target: '_blank' },
          })
        "
      >
        <UFormField label="What would you like to do?" name="tour"
          ><USelect v-model="selected" :items="choices"
        /></UFormField>
        <UFormField label="Preferred date" name="date"
          ><UInput v-model="date" type="date" :min="today"
        /></UFormField>
        <UFormField label="People" name="people"
          ><UInput v-model="people" type="number" :min="1" :max="50" required
        /></UFormField>
        <UFormField label="Anything else?" name="notes"
          ><UTextarea
            v-model="notes"
            :rows="3"
            placeholder="Cycling experience, special requests, or a question…"
        /></UFormField>
        <UButton type="submit" block>Continue in WhatsApp</UButton>
        <UButton :to="emailUrl" variant="outline" color="neutral" block
          >Open your email app</UButton
        >
        <p>
          This prepares an enquiry. Your ride is booked only when Ben confirms
          it. This form does not store your enquiry.
        </p>
      </form>
    </UCard>
  </UPageSection>
</template>
<script setup lang="ts">
import { enquiryUrl, tours } from '~/content/tours'
const route = useRoute()
const choices = [
  ...tours.map((tour) => tour.name),
  'Bike rental',
  'Bespoke tour',
]
const selected = ref<string>(tours[0].name)
watch(
  () => route.query.tour,
  (value) => {
    selected.value =
      typeof value === 'string' && choices.includes(value)
        ? value
        : tours[0].name
  },
  { immediate: true }
)
const date = ref('')
const people = ref(2)
const notes = ref('')
const today = new Date().toISOString().slice(0, 10)
const message = computed(() =>
  [
    'Hi Ben, I would like to enquire about ' + selected.value + '.',
    date.value ? 'Preferred date: ' + date.value : '',
    'Group size: ' + people.value,
    notes.value.trim(),
  ]
    .filter(Boolean)
    .join('\n')
)
const emailUrl = computed(
  () =>
    'mailto:info@interlakenbiketours.com?subject=' +
    encodeURIComponent('Bike tour enquiry: ' + selected.value) +
    '&body=' +
    encodeURIComponent(message.value)
)
</script>
<style scoped>
.tour-enquiry-form {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
</style>
