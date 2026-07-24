<template>
  <div>
    <BookWithNatsPageIntro
      eyebrow="Availability enquiry"
      title="When would you like to stay?"
      :description="bookWithNatsContent.contact.note"
    />

    <section class="booking">
      <form class="booking__form" @submit.prevent="prepareEnquiry">
        <label class="booking__wide">
          Apartment
          <select v-model="form.propertyId">
            <option
              v-for="property in bookWithNatsContent.properties"
              :key="property.id"
              :value="property.id"
            >
              {{ property.name }} · {{ property.location }}
            </option>
          </select>
        </label>
        <label>
          Check in
          <input v-model="form.checkIn" type="date" :min="today" required>
        </label>
        <label>
          Check out
          <input
            v-model="form.checkOut"
            type="date"
            :min="form.checkIn || today"
            required
          >
        </label>
        <label>
          Guests
          <select v-model="form.guests">
            <option :value="1">1 guest</option>
            <option :value="2">2 guests</option>
          </select>
        </label>
        <label>
          Your name
          <input v-model.trim="form.name" type="text" autocomplete="name" required>
        </label>
        <label>
          Email
          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            required
          >
        </label>
        <label class="booking__wide">
          Anything Nats should know?
          <textarea
            v-model.trim="form.note"
            rows="5"
            placeholder="What brings you here, arrival questions, or anything that would make the stay special…"
          />
        </label>
        <p v-if="error" class="booking__error">{{ error }}</p>
        <button type="submit">
          Prepare enquiry
          <UIcon name="i-lucide-arrow-right" />
        </button>
      </form>

      <aside>
        <p>How it works</p>
        <ol>
          <li><span>1</span> Share the dates that suit you.</li>
          <li><span>2</span> Nats confirms availability personally.</li>
          <li><span>3</span> You receive the booking and arrival details.</li>
        </ol>
        <small>
          This first version prepares a booking request on your device. No
          payment is taken and your details are not stored.
        </small>
      </aside>
    </section>

    <UModal v-model:open="enquiryReady" title="Your enquiry is ready">
      <template #body>
        <div class="enquiry-ready">
          <p>
            Copy the message below and send it to Nats through your preferred
            contact channel.
          </p>
          <pre>{{ enquiryText }}</pre>
          <UButton
            :label="copied ? 'Copied' : 'Copy enquiry'"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            block
            @click="copyEnquiry"
          />
          <UButton
            v-if="canShare"
            label="Share enquiry"
            icon="i-lucide-share-2"
            color="neutral"
            variant="outline"
            block
            @click="shareEnquiry"
          />
          <NuxtLink to="/contact">Open contact page</NuxtLink>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import {
  bookWithNatsContent,
  primaryNatsProperty,
} from '../config/content.config'

definePageMeta({ layout: 'nats-default' })

const today = new Date().toISOString().slice(0, 10)
const route = useRoute()
const requestedPropertyId = String(route.query.stay || '')
const initialProperty = bookWithNatsContent.properties.some(
  property => property.id === requestedPropertyId,
)
  ? requestedPropertyId
  : primaryNatsProperty.id
const form = reactive({
  propertyId: initialProperty,
  checkIn: '',
  checkOut: '',
  guests: 2,
  name: '',
  email: '',
  note: '',
})
const selectedProperty = computed(
  () =>
    bookWithNatsContent.properties.find(
      property => property.id === form.propertyId,
    ) ?? primaryNatsProperty,
)
const enquiryReady = ref(false)
const copied = ref(false)
const error = ref('')
const canShare = computed(
  () => import.meta.client && typeof navigator.share === 'function',
)
const enquiryText = computed(
  () =>
    `Hi Nats,\n\nI'd like to ask about ${selectedProperty.value.name}.\n` +
    `Check in: ${form.checkIn}\nCheck out: ${form.checkOut}\n` +
    `Guests: ${form.guests}\nName: ${form.name}\nEmail: ${form.email}` +
    `${form.note ? `\n\nA little about the trip:\n${form.note}` : ''}`,
)

function prepareEnquiry() {
  error.value = ''
  if (form.checkOut <= form.checkIn) {
    error.value = 'Check out needs to be after check in.'
    return
  }
  copied.value = false
  enquiryReady.value = true
}

async function copyEnquiry() {
  await navigator.clipboard.writeText(enquiryText.value)
  copied.value = true
}

async function shareEnquiry() {
  await navigator.share({
    title: 'Stay enquiry for Nats',
    text: enquiryText.value,
  })
}

useSeoMeta({
  title: 'Check dates | Book with Nats',
  description: bookWithNatsContent.contact.note,
})
</script>

<style scoped>
.booking {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(1calc(var(--spacing) * 32), 0.7fr);
  gap: clamp(calc(var(--spacing) * 8), 7vw, calc(var(--spacing) * 28));
  padding: clamp(calc(var(--spacing) * 16), 8vw, calc(var(--spacing) * 32)) clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24));
}

.booking__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.calc(var(--spacing) * 8);
}

.booking label {
  display: grid;
  gap: 0.5calc(var(--spacing) * 20);
  color: var(--nats-muted);
  font-size: 0.7calc(var(--spacing) * 24);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.booking input,
.booking select,
.booking textarea {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--nats-line);
  border-radius: 0;
  outline: none;
  background: transparent;
  color: var(--nats-ink);
  font: inherit;
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0;
  text-transform: none;
}

.booking input,
.booking select {
  min-height: 3.calc(var(--spacing) * 12);
}

.booking textarea {
  padding: 0.calc(var(--spacing) * 32) 0;
  resize: vertical;
}

.booking input:focus,
.booking select:focus,
.booking textarea:focus {
  border-color: var(--nats-rust);
}

.booking__wide,
.booking__error,
.booking button {
  grid-column: 1 / -1;
}

.booking__error {
  margin: 0;
  color: #9f2f24;
}

.booking button {
  display: inline-flex;
  min-height: 3.calc(var(--spacing) * 20);
  align-items: center;
  justify-content: center;
  gap: 0.6calc(var(--spacing) * 20);
  border: 0;
  border-radius: 9999px;
  background: var(--nats-rust);
  color: white;
  font-weight: var(--font-weight-extrabold);
  cursor: pointer;
}

.booking aside {
  align-self: start;
  padding: calc(var(--spacing) * 8);
  border-radius: var(--ui-radius);
  background: var(--nats-paper);
}

.booking aside > p {
  font-family: var(--font-serif);
  font-size: calc(var(--spacing) * 8);
}

.booking ol {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding: 0;
  list-style: none;
}

.booking li {
  display: grid;
  grid-template-columns: calc(var(--spacing) * 8) 1fr;
  gap: 0.6calc(var(--spacing) * 20);
  align-items: center;
  color: var(--nats-muted);
}

.booking li span {
  display: grid;
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  place-items: center;
  border-radius: 50%;
  background: var(--nats-gold);
  color: var(--nats-ink);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
}

.booking small {
  display: block;
  margin-top: calc(var(--spacing) * 8);
  color: var(--nats-muted);
  line-height: 1.6;
}

.enquiry-ready {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.enquiry-ready pre {
  max-height: 1calc(var(--spacing) * 32);
  overflow: auto;
  padding: calc(var(--spacing) * 4);
  background: var(--nats-canvas);
  white-space: pre-wrap;
}

.enquiry-ready a {
  color: var(--nats-ink);
  font-weight: var(--font-weight-extrabold);
  text-align: center;
}

@media (max-width: 4calc(var(--spacing) * 32)) {
  .booking,
  .booking__form {
    grid-template-columns: 1fr;
  }

  .booking__wide,
  .booking__error,
  .booking button {
    grid-column: 1;
  }
}
</style>
