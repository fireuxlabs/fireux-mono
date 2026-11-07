<!-- Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: carry pricing, solution, and App context into intake. -->
<template>
  <UPage>
    <UButton to="/" variant="link"> FireUX </UButton>
    <UPageHeader
      :title="appMeta.getStarted.title"
      :description="appMeta.getStarted.description"
      :headline="appMeta.getStarted.eyebrow"
    />
    <UPageBody>
      <UPageGrid>
        <UCard variant="subtle">
          <p class="fx-type-caption">Setup</p>
          <p class="fx-type-body">
            {{ appMeta.getStarted.setupPrice }}
          </p>
          <p class="fx-type-caption">Branding, configuration, and launch.</p>
        </UCard>

        <UCard variant="subtle">
          <p class="fx-type-caption">Monthly plan</p>
          <p class="fx-type-body">
            {{ appMeta.getStarted.monthlyPrice }}
          </p>
          <p class="fx-type-caption">
            CHF 50/month for each Entity managed by the App.
          </p>
        </UCard>
      </UPageGrid>

      <section class="pagebody">
        <h2 class="fx-type-section-title">Included</h2>
        <ul class="fx-list-stack">
          <li v-for="item in appMeta.getStarted.included" :key="item">
            <UIcon name="i-lucide-check" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>

      <UCard id="ignition-request">
        <template #header>
          <div class="fx-card-body-stack">
            <UBadge v-if="originLabel" color="neutral" variant="soft">
              {{ originLabel }}
            </UBadge>
            <h2 class="fx-type-section-title">
              {{
                submittedReference
                  ? 'Request received'
                  : fireuxOffer.ignition.requestTitle
              }}
            </h2>
            <p class="fx-type-caption">
              {{
                submittedReference
                  ? `We will reply to ${form.contact_email}.`
                  : fireuxOffer.ignition.requestDescription
              }}
            </p>
          </div>
        </template>

        <div v-if="submittedReference" class="fx-card-body-stack">
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            title="Your request is saved"
            :description="`Reference ${submittedReference}`"
          />

          <ol class="fx-list-stack">
            <li v-for="(step, index) in confirmationSteps" :key="step.title">
              <p class="fx-type-caption">
                {{ index + 1 }}
              </p>
              <p class="fx-type-body">
                {{ step.title }}
              </p>
              <p class="fx-type-caption">{{ step.description }}</p>
            </li>
          </ol>

          <UButton color="neutral" variant="soft" @click="resetForm">
            Send another request
          </UButton>
        </div>

        <UForm v-else :state="form" @submit="submitRequest">
          <div class="workspace-surface__grid workspace-surface__grid--2">
            <UFormField label="Your name" required :error="errors.contact_name">
              <UInput
                v-model="form.contact_name"
                autocomplete="name"
                placeholder="Sarah Jones"
              />
            </UFormField>

            <UFormField label="Email" required :error="errors.contact_email">
              <UInput
                v-model="form.contact_email"
                type="email"
                autocomplete="email"
                placeholder="sarah@example.com"
              />
            </UFormField>
          </div>

          <div class="workspace-surface__grid workspace-surface__grid--2">
            <UFormField
              label="Business name"
              required
              :error="errors.business_name"
            >
              <UInput
                v-model="form.business_name"
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
                type="url"
                inputmode="url"
                autocomplete="url"
                placeholder="https://example.com"
                @blur="normalizeWebsite"
              />
            </UFormField>
          </div>

          <UFormField label="Branding" required :error="errors.branding">
            <USelect v-model="form.branding" :items="brandingOptions" />
          </UFormField>

          <UFormField label="Pages" required :error="errors.pages">
            <UCard>
              <UCheckbox
                v-for="page in pageOptions"
                :key="page.value"
                :model-value="form.pages.includes(page.value)"
                :label="page.label"
                @update:model-value="togglePage(page.value, Boolean($event))"
              />
            </UCard>
          </UFormField>

          <UFormField
            label="What does the App need to do?"
            required
            :error="errors.app_job"
          >
            <UTextarea
              v-model="form.app_job"
              :rows="5"
              placeholder="For example: let customers request a cleaning job and let me manage it."
            />
          </UFormField>

          <UFormField label="Who needs access?" required :error="errors.access">
            <UTextarea
              v-model="form.access"
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

          <UFormField :error="errors.privacy_acknowledged">
            <UCheckbox
              v-model="form.privacy_acknowledged"
              label="FireUX may use these details to reply to my request."
            />
            <template #help
              >See the
              <ULink to="/legal#privacy">Privacy Policy</ULink>.</template
            >
          </UFormField>

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

      <div class="fx-card__actions">
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
      </div>
    </UPageBody>
  </UPage>
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
