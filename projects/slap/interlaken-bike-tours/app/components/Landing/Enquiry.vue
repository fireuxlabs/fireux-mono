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
<template>
  <section id="contact" class="enquiry-section section">
    <div class="enquiry-grid wrap">
      <div>
        <p class="eyebrow">05 / Contact</p>
        <h2>Your next good day starts here.</h2>
        <p>
          Tell Ben what you're thinking. Dates, group size, a place you've
          always wanted to see — we'll start there.
        </p>
        <p>Looking for a ride today? Ask about same-day availability.</p>
        <a href="tel:+41764659530" class="phone-link">+41 76 465 95 30 ↗</a>
      </div>
      <form
        id="enquire"
        class="enquiry-form"
        @submit.prevent="
          navigateTo(enquiryUrl(message), {
            external: true,
            open: { target: '_blank' },
          })
        "
      >
        <UFormField label="What would you like to do?" name="tour"
          ><select
            v-model="selected"
            id="ride-choice"
            aria-label="What would you like to do?"
            class="native-select"
          >
            <option v-for="choice in choices" :key="choice">
              {{ choice }}
            </option>
          </select></UFormField
        >
        <div class="form-row">
          <UFormField label="Preferred date" name="date"
            ><UInput
              v-model="date"
              type="date"
              :min="today"
              class="form-control"
              size="lg" /></UFormField
          ><UFormField label="People" name="people"
            ><UInput
              v-model="people"
              type="number"
              :min="1"
              :max="50"
              required
              class="form-control"
              size="lg"
          /></UFormField>
        </div>
        <UFormField label="Anything else?" name="notes"
          ><UTextarea
            v-model="notes"
            :rows="3"
            class="form-control"
            placeholder="Cycling experience, special requests, or a question…"
        /></UFormField>
        <UButton
          type="submit"
          size="xl"
          block
          trailing-icon="i-lucide-arrow-up-right"
          >Continue in WhatsApp</UButton
        >
        <a :href="emailUrl" class="email-alternative"
          >Prefer email? Open your email app ↗</a
        >
        <p class="form-note">
          This prepares an enquiry. Your ride is booked only when Ben confirms
          it. Nothing is stored by this prototype.
        </p>
      </form>
    </div>
  </section>
</template>
