<!-- Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: carry pricing, solution, and App context into intake. -->
<template>
  <PublicSimplePage
    :title="appMeta.getStarted.title"
    :description="appMeta.getStarted.description"
    :eyebrow="appMeta.getStarted.eyebrow"
    back-label="FireUX"
  >
    <section class="grid gap-4 sm:grid-cols-2">
      <UCard variant="subtle">
        <p class="text-sm text-muted">Setup</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.setupPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">
          Branding, configuration, and launch.
        </p>
      </UCard>

      <UCard variant="subtle">
        <p class="text-sm text-muted">Maintenance</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.monthlyPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">
          Hosting, updates, and maintenance.
        </p>
      </UCard>
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">Included</h2>
      <ul class="space-y-2 text-muted">
        <li
          v-for="item in appMeta.getStarted.included"
          :key="item"
          class="flex items-start gap-2"
        >
          <UIcon name="i-lucide-check" class="mt-1 shrink-0 text-primary" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>

    <UCard id="ignition-request">
      <template #header>
        <div class="space-y-1">
          <UBadge v-if="originLabel" color="neutral" variant="soft">
            {{ originLabel }}
          </UBadge>
          <h2 class="text-xl font-semibold text-highlighted">
            {{ submittedReference ? 'Request received' : 'Request Ignition' }}
          </h2>
          <p class="text-sm text-muted">
            {{
              submittedReference
                ? `We will reply to ${form.contact_email}.`
                : 'Tell us what to configure. No payment is taken here.'
            }}
          </p>
        </div>
      </template>

      <div v-if="submittedReference" class="space-y-5">
        <UAlert
          color="success"
          variant="soft"
          icon="i-lucide-circle-check"
          title="Your request is saved"
          :description="`Reference ${submittedReference}`"
        />

        <ol class="grid gap-3 sm:grid-cols-3">
          <li
            v-for="(step, index) in confirmationSteps"
            :key="step.title"
            class="rounded-lg border border-default p-4"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-primary"
            >
              {{ index + 1 }}
            </p>
            <p class="mt-2 font-semibold text-highlighted">{{ step.title }}</p>
            <p class="mt-1 text-sm text-muted">{{ step.description }}</p>
          </li>
        </ol>

        <UButton color="neutral" variant="soft" @click="resetForm">
          Send another request
        </UButton>
      </div>

      <UForm v-else :state="form" class="space-y-5" @submit="submitRequest">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Your name" required :error="errors.contact_name">
            <UInput
              v-model="form.contact_name"
              class="w-full"
              autocomplete="name"
              placeholder="Sarah Jones"
            />
          </UFormField>

          <UFormField label="Email" required :error="errors.contact_email">
            <UInput
              v-model="form.contact_email"
              class="w-full"
              type="email"
              autocomplete="email"
              placeholder="sarah@example.com"
            />
          </UFormField>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            label="Business name"
            required
            :error="errors.business_name"
          >
            <UInput
              v-model="form.business_name"
              class="w-full"
              autocomplete="organization"
              placeholder="Sarah's Services"
            />
          </UFormField>

          <UFormField
            label="Existing website"
            hint="Optional"
            :error="errors.website"
          >
            <UInput
              v-model="form.website"
              class="w-full"
              type="url"
              inputmode="url"
              autocomplete="url"
              placeholder="https://example.com"
              @blur="normalizeWebsite"
            />
          </UFormField>
        </div>

        <UFormField label="Branding" required :error="errors.branding">
          <USelect
            v-model="form.branding"
            class="w-full"
            :items="brandingOptions"
          />
        </UFormField>

        <UFormField label="Pages" required :error="errors.pages">
          <div
            class="grid gap-3 rounded-lg border border-default p-4 sm:grid-cols-2"
          >
            <UCheckbox
              v-for="page in pageOptions"
              :key="page.value"
              :model-value="form.pages.includes(page.value)"
              :label="page.label"
              @update:model-value="togglePage(page.value, Boolean($event))"
            />
          </div>
        </UFormField>

        <UFormField
          label="What does the App need to do?"
          required
          :error="errors.app_job"
        >
          <UTextarea
            v-model="form.app_job"
            class="w-full"
            :rows="5"
            placeholder="For example: let customers request a cleaning job and let me manage it."
          />
        </UFormField>

        <UFormField label="Who needs access?" required :error="errors.access">
          <UTextarea
            v-model="form.access"
            class="w-full"
            :rows="3"
            placeholder="For example: me, two staff members, and customers."
          />
        </UFormField>

        <div hidden aria-hidden="true">
          <label for="ignition-fax">Fax number</label>
          <input
            id="ignition-fax"
            v-model="form.fax_number"
            name="fax_number"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <div class="space-y-2">
          <UCheckbox
            v-model="form.privacy_acknowledged"
            label="FireUX may use these details to reply to my request."
          />
          <p v-if="errors.privacy_acknowledged" class="text-sm text-error">
            {{ errors.privacy_acknowledged }}
          </p>
          <p class="text-xs text-muted">
            See the
            <NuxtLink to="/legal/privacy" class="text-primary hover:underline"
              >Privacy Policy</NuxtLink
            >.
          </p>
        </div>

        <UAlert
          v-if="requestError"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Request not sent"
          :description="requestError"
        />

        <UButton
          type="submit"
          icon="i-lucide-rocket"
          size="lg"
          :loading="submitting"
          :disabled="submitting"
        >
          Send request
        </UButton>
      </UForm>
    </UCard>

    <template #actions>
      <UButton
        :to="appMeta.getStarted.action.to"
        icon="i-lucide-mail"
        color="neutral"
        variant="soft"
      >
        {{ appMeta.getStarted.action.label }}
      </UButton>
      <UButton to="/apps" color="neutral" variant="ghost">
        View FireUX apps
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from '#imports'
import { appMeta } from '../meta'

type IgnitionResponse = {
  ok: true
  reference: string
}

const pageOptions = [
  { label: 'Home', value: 'home' },
  { label: 'About', value: 'about' },
  { label: 'Services', value: 'services' },
  { label: 'Products', value: 'products' },
  { label: 'Booking or request', value: 'booking' },
  { label: 'News', value: 'news' },
  { label: 'Contact', value: 'contact' },
  { label: 'Customer account', value: 'account' },
] as const

type PageOption = (typeof pageOptions)[number]['value']
type IgnitionOrigin = {
  surface: 'pricing' | 'solution' | 'app-directory'
  ref: string
}

const brandingOptions = [
  { label: 'Logo and colours ready', value: 'ready' },
  { label: 'Use my current website', value: 'use-existing' },
  { label: 'I need help with branding', value: 'help' },
]

const confirmationSteps = [
  { title: 'Review', description: 'We check the request and reply.' },
  { title: 'Build', description: 'We agree the scope and configure the app.' },
  {
    title: 'Launch',
    description: 'You approve it. We deploy and invite users.',
  },
]

const initialForm = () => ({
  contact_name: '',
  contact_email: '',
  business_name: '',
  website: '',
  branding: 'ready',
  pages: ['home', 'services', 'contact'] as PageOption[],
  app_job: '',
  access: '',
  privacy_acknowledged: false,
  fax_number: '',
})

const form = reactive(initialForm())
const route = useRoute()
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)
const requestError = ref('')
const submittedReference = ref('')

function queryValue(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value
  return String(candidate ?? '').trim().toLowerCase()
}

function safeOriginRef(value: unknown) {
  const candidate = queryValue(value)
  return /^[a-z0-9](?:[a-z0-9-]{0,94}[a-z0-9])?$/.test(candidate)
    ? candidate
    : ''
}

const origin = computed<IgnitionOrigin | null>(() => {
  if (queryValue(route.query.from) === 'pricing-apps') {
    return { surface: 'pricing', ref: 'apps' }
  }

  const solution = safeOriginRef(route.query.solution)
  if (solution) return { surface: 'solution', ref: solution }

  const example = safeOriginRef(route.query.example)
  if (example) return { surface: 'app-directory', ref: example }

  return null
})

const originLabel = computed(() => {
  if (origin.value?.surface === 'pricing') return 'From app pricing'
  if (origin.value?.surface === 'solution') return 'From a FireUX solution'
  if (origin.value?.surface === 'app-directory') return 'From an app example'
  return ''
})

function normalizeWebsite() {
  const website = form.website.trim()
  if (website && !/^https?:\/\//i.test(website)) {
    form.website = `https://${website}`
  }
}

function togglePage(page: PageOption, checked: boolean) {
  const next = new Set(form.pages)
  if (checked) next.add(page)
  else next.delete(page)
  form.pages = Array.from(next)
}

function validate() {
  for (const key of Object.keys(errors)) delete errors[key]
  if (form.contact_name.trim().length < 2)
    errors.contact_name = 'Add your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
    errors.contact_email = 'Add a valid email.'
  }
  if (form.business_name.trim().length < 2) {
    errors.business_name = 'Add the business name.'
  }
  if (form.website.trim()) {
    normalizeWebsite()
    try {
      const website = new URL(form.website)
      if (!['http:', 'https:'].includes(website.protocol)) throw new Error()
    } catch {
      errors.website = 'Add a valid website address.'
    }
  }
  if (!form.branding) errors.branding = 'Choose a branding option.'
  if (!form.pages.length) errors.pages = 'Choose at least one page.'
  if (form.app_job.trim().length < 10) {
    errors.app_job = 'Describe what the App needs to do in a little more detail.'
  }
  if (form.access.trim().length < 3) errors.access = 'Tell us who needs access.'
  if (!form.privacy_acknowledged) {
    errors.privacy_acknowledged = 'Confirm that FireUX may reply.'
  }
  return Object.keys(errors).length === 0
}

function responseMessage(error: unknown) {
  const source = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
    message?: string
  }
  return (
    source.data?.statusMessage ||
    source.data?.message ||
    source.statusMessage ||
    source.message ||
    'Please try again or email fire@fireux.app.'
  )
}

async function submitRequest() {
  requestError.value = ''
  if (!validate() || submitting.value) return

  submitting.value = true
  try {
    const response = await $fetch<IgnitionResponse>('/api/public/ignition', {
      method: 'POST',
      body: {
        ...form,
        ...(origin.value ? { origin: origin.value } : {}),
      },
    })
    submittedReference.value = response.reference
  } catch (error) {
    requestError.value = responseMessage(error)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, initialForm())
  for (const key of Object.keys(errors)) delete errors[key]
  requestError.value = ''
  submittedReference.value = ''
}

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Ignition',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoGetStarted.title,
  description: appMeta.seoGetStarted.description,
})
</script>
