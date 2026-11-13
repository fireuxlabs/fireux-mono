<template>
  <section id="enquire" class="alpine-enquiry" aria-labelledby="enquiry-title">
    <UContainer
      ><div class="alpine-enquiry__grid">
        <div class="alpine-enquiry__intro">
          <p class="alpine-enquiry__kicker">Swiss Alpine Guides</p>
          <h2 id="enquiry-title">Plan your<br />activity</h2>
          <p>{{ operator.address }}</p>
          <div class="alpine-enquiry__aside">
            <p>
              <a :href="`tel:${operator.telephone}`">{{ operator.phoneLabel }}</a><br /><a
                href="https://wa.me/41796526000"
                target="_blank"
                rel="noopener noreferrer"
                >WhatsApp +41 79 652 60 00</a
              ><br /><a :href="`mailto:${operator.email}`"
                >{{ operator.email }}</a
              >
            </p>
            <p>
              Choose an activity, rental or voucher enquiry and provide your preferred date, group size and questions. This prototype prepares an email enquiry; it does not
              confirm a reservation.
            </p>
          </div>
        </div>
        <form class="alpine-enquiry__form" @submit.prevent="prepare">
          <UFormField label="Activity or tour" name="tour"
            ><USelect
              class="alpine-enquiry__control"
              v-model="form.tour"
              :items="tourItems"
              required
          /></UFormField>
          <div class="alpine-enquiry__pair">
            <UFormField label="Preferred date" name="date"
              ><UInput
                class="alpine-enquiry__control"
                v-model="form.date"
                type="date"
                :required="!form.flexible" /></UFormField
            ><UFormField label="Group size" name="groupSize"
              ><UInput
                class="alpine-enquiry__control"
                v-model="form.groupSize"
                type="number"
                :min="1"
                :max="30"
                required
            /></UFormField>
          </div>
          <UCheckbox v-model="form.flexible" label="My dates are flexible" />
          <UFormField v-if="selectedOption?.heli" label="Ski / board group" name="activity"
            ><USelect
              class="alpine-enquiry__control"
              v-model="form.activity"
              :items="activityItems"
              required
          /></UFormField>
          <UFormField label="Your name" name="name"
            ><UInput
              class="alpine-enquiry__control"
              v-model="form.name"
              autocomplete="name"
              :maxlength="100"
              required
          /></UFormField>
          <div class="alpine-enquiry__pair">
            <UFormField label="Email address" name="email"
              ><UInput
                class="alpine-enquiry__control"
                v-model="form.email"
                type="email"
                autocomplete="email"
                :maxlength="254"
                required /></UFormField
            ><UFormField label="Phone (optional)" name="phone"
              ><UInput
                class="alpine-enquiry__control"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                :maxlength="40"
            /></UFormField>
          </div>
          <UFormField label="Experience & questions" name="notes"
            ><UTextarea
              class="alpine-enquiry__control"
              v-model="form.notes"
              :rows="3"
              :maxlength="1500"
              placeholder="Skiing or snowboarding experience, equipment and questions…"
          /></UFormField>
          <div class="alpine-enquiry__trap" aria-hidden="true">
            <label
              >Website<input
                v-model="form.website"
                tabindex="-1"
                autocomplete="off"
            /></label>
          </div>
          <UCheckbox
            v-model="form.acknowledgement"
            label="I understand this is an enquiry. Conditions, price and arrangements require operator confirmation."
            required
          />
          <UButton
            type="submit"
            size="xl"
            color="neutral"
            block
            :loading="pending"
            >Prepare my enquiry <span aria-hidden="true">↗</span></UButton
          >
          <p class="alpine-enquiry__privacy">
            This preview validates your details to prepare an email draft. It
            does not store them, send an email or confirm a booking.
          </p>
          <UAlert
            v-if="error"
            color="error"
            :description="error"
            role="alert"
          />
          <div v-if="draft" class="alpine-enquiry__draft" role="status">
            <h3>Your draft is ready.</h3>
            <p>
              Nothing has been sent. Open your email app to review and send your
              enquiry. The draft is addressed to the operator’s published
              heliskiing contact.
            </p>
            <UButton :to="emailUrl" color="neutral"
              >Open email draft ↗</UButton
            >
            <details>
              <summary>View or copy the enquiry text</summary>
              <pre>{{ draft.body }}</pre>
            </details>
          </div>
        </form>
      </div></UContainer
    >
  </section>
</template>
<script setup lang="ts">
import { operator } from '~/content/operator'
import { enquiryOptions } from '~/content/enquiry-options'
const route = useRoute()
const tourItems = enquiryOptions.map(item => ({ label: item.name, value: item.id }))
const activityItems = [
  { label: 'Skiing', value: 'ski' },
  { label: 'Snowboarding', value: 'snowboard' },
  { label: 'Mixed group', value: 'mixed' },
]
const form = reactive({
  tour: 'general',
  date: '',
  flexible: true,
  groupSize: 2,
  activity: 'ski',
  name: '',
  email: '',
  phone: '',
  notes: '',
  website: '',
  acknowledgement: false,
})
watch(
  () => route.query.tour,
  (value) => {
    const selected = enquiryOptions.find(item => item.id === value)
    if (selected) form.tour = selected.id
  },
  { immediate: true }
)
const selectedOption = computed(() => enquiryOptions.find(item => item.id === form.tour))
watch(() => route.query.programme, value => { if (typeof value === 'string' && !form.notes) form.notes = `Programme: ${value}` }, { immediate: true })
const pending = ref(false)
const error = ref('')
const draft = ref<{ subject: string; body: string; to: string } | null>(null)
let revision = 0
watch(form, () => {
  revision++
  draft.value = null
  error.value = ''
})
const emailUrl = computed(() =>
  draft.value
    ? `mailto:${draft.value.to}?subject=${encodeURIComponent(draft.value.subject)}&body=${encodeURIComponent(draft.value.body)}`
    : ''
)
async function prepare() {
  if (pending.value) return
  const expected = revision
  pending.value = true
  error.value = ''
  draft.value = null
  try {
    const result = await $fetch<{ subject: string; body: string; to: string }>(
      '/api/enquiry',
      { method: 'POST', body: { ...form, activity: selectedOption.value?.heli ? form.activity : 'other', groupSize: Number(form.groupSize) } }
    )
    if (revision === expected) draft.value = result
  } catch (cause) {
    if (revision === expected)
      error.value =
        (cause as { data?: { statusMessage?: string } })?.data?.statusMessage ||
        'We could not prepare your enquiry. Check the details and try again.'
  } finally {
    pending.value = false
  }
}
</script>
<style scoped>
.alpine-enquiry {
  padding: 100px 0;
  background: #f7f7f3;
  scroll-margin-top: calc(var(--ui-header-height, 4rem) + 1rem);
}
.alpine-enquiry__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
}
.alpine-enquiry__kicker {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 30px;
}
.alpine-enquiry h2 {
  font:
    400 clamp(45px, 5vw, 72px) / 1.02 Georgia,
    serif;
  letter-spacing: -0.04em;
  margin-bottom: 26px;
}
.alpine-enquiry h2 em {
  color: #72847b;
  font-weight: 400;
}
.alpine-enquiry__intro > p:not(:first-child) {
  font-size: 14px;
  line-height: 1.9;
  max-width: 370px;
  color: #53676c;
}
.alpine-enquiry__aside {
  margin-top: 60px;
  border-top: 1px solid #ced8d0;
  padding-top: 24px;
  max-width: 370px;
  font-size: 12px;
  line-height: 1.8;
}
.alpine-enquiry__aside > span {
  font-family: Georgia, serif;
  font-size: 18px;
}
.alpine-enquiry__aside p {
  color: #53676c;
  margin-top: 12px;
}
.alpine-enquiry__form :deep(.alpine-enquiry__control) {
  width: 100%;
}
.alpine-enquiry__form {
  display: grid;
  gap: 20px;
  min-width: 0;
}
.alpine-enquiry__pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.alpine-enquiry__form :deep(input),
.alpine-enquiry__form :deep(textarea) {
  width: 100%;
}
.alpine-enquiry__form :deep([data-slot='root']) {
  max-width: 100%;
}
.alpine-enquiry__privacy {
  font-size: 10px;
  line-height: 1.7;
  color: #53676c;
}
.alpine-enquiry__trap {
  position: absolute;
  left: -10000px;
}
.alpine-enquiry__draft {
  padding: 24px;
  background: #e4e8e1;
  font-size: 13px;
  line-height: 1.7;
}
.alpine-enquiry__draft h3 {
  font:
    24px Georgia,
    serif;
}
.alpine-enquiry__draft p {
  margin: 12px 0 20px;
}
.alpine-enquiry__draft details {
  margin-top: 16px;
}
.alpine-enquiry__draft pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: 12px/1.6 sans-serif;
  margin-top: 14px;
}
@media (max-width: 800px) {
  .alpine-enquiry {
    padding: 65px 0;
  }
  .alpine-enquiry__grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .alpine-enquiry__aside {
    margin-top: 30px;
  }
  .alpine-enquiry__intro > p:not(:first-child) {
    max-width: none;
  }
  .alpine-enquiry__aside {
    max-width: none;
  }
}
@media (max-width: 400px) {
  .alpine-enquiry__pair {
    grid-template-columns: 1fr;
  }
}
</style>
