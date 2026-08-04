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
        <p class="text-sm text-muted">Monthly plan</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.monthlyPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">
          CHF 20 Pro or CHF 50 Managed.
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
            {{
              submittedReference
                ? 'Request received'
                : fireuxOffer.ignition.requestTitle
            }}
          </h2>
          <p class="text-sm text-muted">
            {{
              submittedReference
                ? `We will reply to ${form.contact_email}.`
                : fireuxOffer.ignition.requestDescription
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
import { appMeta, fireuxOffer } from '../meta'
import { useIgnitionRequestForm } from '../composables/useIgnitionRequestForm'

const {
  brandingOptions,
  confirmationSteps,
  errors,
  form,
  normalizeWebsite,
  origin,
  originLabel,
  pageOptions,
  requestError,
  resetForm,
  submitRequest,
  submittedReference,
  submitting,
  togglePage,
} = useIgnitionRequestForm()

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
