<template>
  <div>
    <AusfinnPageIntro
      eyebrow="Availability enquiry"
      title="Bring us your dates."
      description="Tell us which place caught your eye and who is coming. The AUSFinn team will reply directly with availability and the next step."
    />

    <section class="booking">
      <form @submit.prevent="openEmail">
        <label class="wide">
          Stay
          <select v-model="form.stayId">
            <option
              v-for="stay in ausfinnContent.stays"
              :key="stay.id"
              :value="stay.id"
            >
              {{ stay.name }} · {{ stay.location }}
            </option>
          </select>
        </label>
        <label>
          Check in
          <input v-model="form.checkIn" type="date" :min="today" required />
        </label>
        <label>
          Check out
          <input
            v-model="form.checkOut"
            type="date"
            :min="form.checkIn || today"
            required
          />
        </label>
        <label>
          Adults
          <select v-model="form.adults">
            <option v-for="count in 12" :key="count" :value="count">
              {{ count }}
            </option>
          </select>
        </label>
        <label>
          Children
          <select v-model="form.children">
            <option v-for="count in 7" :key="count - 1" :value="count - 1">
              {{ count - 1 }}
            </option>
          </select>
        </label>
        <label>
          Your name
          <input v-model.trim="form.name" autocomplete="name" required />
        </label>
        <label>
          Email
          <input
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            required
          />
        </label>
        <label class="wide">
          Anything we should know?
          <textarea
            v-model.trim="form.note"
            rows="5"
            placeholder="Arrival plans, the reason for your trip, or what would make the stay special…"
          />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit">
          Email this enquiry
          <UIcon name="i-lucide-send" />
        </button>
      </form>

      <aside>
        <p>Simple and direct</p>
        <h2>A real person answers.</h2>
        <ol>
          <li><span>01</span>Tell us the dates and group size.</li>
          <li><span>02</span>Your email app opens with everything ready.</li>
          <li><span>03</span>AUSFinn confirms availability personally.</li>
        </ol>
        <small>
          No payment is taken here. This creates an email to
          {{ ausfinnContent.email }} and does not store your details.
        </small>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ausfinnContent } from '../config/content.config'

definePageMeta({ layout: 'ausfinn-default' })

const route = useRoute()
const requestedStay = String(route.query.stay || '')
const initialStay = ausfinnContent.stays.some(
  (stay) => stay.id === requestedStay
)
  ? requestedStay
  : ausfinnContent.stays[0]!.id
const today = new Date().toISOString().slice(0, 10)
const error = ref('')
const form = reactive({
  stayId: initialStay,
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
  name: '',
  email: '',
  note: '',
})
const selectedStay = computed(
  () =>
    ausfinnContent.stays.find((stay) => stay.id === form.stayId) ??
    ausfinnContent.stays[0]!
)

function openEmail() {
  error.value = ''
  if (form.checkOut <= form.checkIn) {
    error.value = 'Check out needs to be after check in.'
    return
  }

  const subject = `Stay enquiry · ${selectedStay.value.name}`
  const body = [
    'Hello AUSFinn team,',
    '',
    `I would like to ask about ${selectedStay.value.name}.`,
    `Check in: ${form.checkIn}`,
    `Check out: ${form.checkOut}`,
    `Guests: ${form.adults} adults, ${form.children} children`,
    `Name: ${form.name}`,
    `Reply email: ${form.email}`,
    form.note ? `\nA little about our trip:\n${form.note}` : '',
  ].join('\n')

  window.location.href =
    `mailto:${ausfinnContent.email}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
}

useSeoMeta({
  title: 'Check dates | AUSFinn Apartments',
  description:
    'Send AUSFinn a direct availability enquiry for your preferred stay.',
})
</script>

<style scoped>
.booking {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.65fr);
  gap: clamp(calc(var(--spacing) * 10), 8vw, calc(var(--spacing) * 28));
  padding: clamp(calc(var(--spacing) * 18), 9vw, calc(var(--spacing) * 34))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 20));
}

form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 6);
}

label {
  display: grid;
  gap: calc(var(--spacing) * 2);
  color: var(--aus-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

input,
select,
textarea {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--aus-line);
  border-radius: 0;
  outline: 0;
  background: transparent;
  color: var(--aus-ink);
  font: inherit;
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0;
  text-transform: none;
}

input,
select {
  min-height: 3.25rem;
}

textarea {
  padding-block: calc(var(--spacing) * 3);
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--aus-coral);
}

.wide,
.error,
form button {
  grid-column: 1 / -1;
}

.error {
  margin: 0;
  color: #9f2f24;
}

form button {
  display: inline-flex;
  min-height: 4rem;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
  border: 0;
  border-radius: 9999px;
  background: var(--aus-coral);
  color: var(--aus-white);
  font: inherit;
  font-weight: var(--font-weight-extrabold);
  cursor: pointer;
}

aside {
  align-self: start;
  padding: calc(var(--spacing) * 8);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--aus-mist);
}

aside > p {
  color: var(--aus-coral);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

aside h2 {
  margin: calc(var(--spacing) * 4) 0 calc(var(--spacing) * 8);
  font-family: var(--font-serif);
  font-size: 3rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.05em;
  line-height: 0.95;
}

aside ol {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding: 0;
  list-style: none;
}

aside li {
  display: grid;
  grid-template-columns: calc(var(--spacing) * 8) 1fr;
  gap: calc(var(--spacing) * 3);
  color: var(--aus-muted);
  line-height: 1.5;
}

aside li span {
  color: var(--aus-lake);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
}

aside small {
  display: block;
  margin-top: calc(var(--spacing) * 8);
  color: var(--aus-muted);
  line-height: 1.6;
}

@media (max-width: 50rem) {
  .booking,
  form {
    grid-template-columns: 1fr;
  }

  .wide,
  .error,
  form button {
    grid-column: 1;
  }
}
</style>
