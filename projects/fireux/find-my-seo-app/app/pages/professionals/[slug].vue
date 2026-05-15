<template>
  <UPage v-if="provider">
    <UPageHeader :title="provider.displayName" :description="provider.headline">
      <template #headline>
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="primaryMediaUrl || undefined"
            :alt="provider.displayName"
            :icon="primaryMediaIcon"
            size="xl"
            class="shrink-0"
          />
          <div class="min-w-0 space-y-2">
            <div v-if="provider.brandName" class="flex items-center gap-2 text-sm text-muted">
              <UAvatar
                v-if="brandLogoUrl"
                :src="brandLogoUrl"
                :alt="provider.brandName"
                size="xs"
                class="shrink-0"
              />
              <span>{{ provider.brandName }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge color="neutral" variant="soft">{{ providerTypeLabel }}</UBadge>
              <UBadge v-if="provider.isFeatured" color="primary" variant="soft">Featured by Charlie</UBadge>
              <UBadge v-if="provider.isVerified" color="success" variant="soft">Verified by Find My SEO</UBadge>
              <UBadge variant="soft">{{ provider.locationLabel }}</UBadge>
              <UBadge variant="soft">{{ provider.availabilityStatus }}</UBadge>
              <UBadge variant="soft">{{ provider.rating.toFixed(1) }} rating · {{ provider.reviewCount }} reviews</UBadge>
            </div>
          </div>
        </div>
      </template>
    </UPageHeader>

    <UPageBody class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="space-y-6">
        <UCard>
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold">Overview</h2>
            <p class="leading-7 text-toned">{{ provider.summary }}</p>
            <p class="text-sm leading-6 text-dimmed">{{ provider.bio }}</p>
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <p class="text-sm text-dimmed">Specialisms</p>
                <p>{{ provider.specialisms.join(', ') }}</p>
              </div>
              <div>
                <p class="text-sm text-dimmed">Services</p>
                <p>{{ provider.servicesOffered.join(', ') }}</p>
              </div>
              <div>
                <p class="text-sm text-dimmed">Sector experience</p>
                <p>{{ provider.sectorExperience.join(', ') }}</p>
              </div>
              <div>
                <p class="text-sm text-dimmed">Pricing guidance</p>
                <p>{{ provider.pricingGuidance }}</p>
              </div>
              <div v-if="provider.yearsExperience">
                <p class="text-sm text-dimmed">Experience</p>
                <p>{{ provider.yearsExperience }} years</p>
              </div>
              <div v-if="provider.teamSizeLabel">
                <p class="text-sm text-dimmed">Team shape</p>
                <p>{{ provider.teamSizeLabel }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="provider.trustNote || provider.proofHighlights.length">
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold">Trust summary</h2>
            <p v-if="provider.trustNote" class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-toned">
              {{ provider.trustNote }}
            </p>
            <ul class="space-y-3">
              <li v-for="proof in provider.proofHighlights" :key="proof" class="rounded-xl border border-default p-4">
                {{ proof }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard v-if="caseStudies.length">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-2xl font-semibold">Case studies</h2>
              <UButton variant="ghost" to="/case-studies">View all case studies</UButton>
            </div>
            <div v-for="study in caseStudies" :key="study.id" class="rounded-xl border border-default p-4">
              <div class="space-y-3">
                <div>
                  <p class="text-lg font-semibold">{{ study.title }}</p>
                  <p class="mt-1 text-sm text-dimmed">{{ study.clientLabel }} · {{ study.timeframeLabel }}</p>
                </div>
                <p class="text-sm leading-6 text-toned">{{ study.problem }}</p>
                <p class="text-sm leading-6">{{ study.resultsSummary }}</p>
                <div class="grid gap-3 lg:grid-cols-2">
                  <div>
                    <p class="font-medium">Actions</p>
                    <ul class="mt-2 space-y-2 text-sm text-toned">
                      <li v-for="action in study.actions" :key="action">{{ action }}</li>
                    </ul>
                  </div>
                  <div>
                    <p class="font-medium">Key metrics</p>
                    <ul class="mt-2 space-y-2 text-sm text-toned">
                      <li v-for="metric in study.metrics" :key="`${study.id}-${metric.label}`">
                        {{ metric.label }}: {{ metric.value }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="provider.testimonials.length">
          <div class="space-y-4">
            <h2 class="text-2xl font-semibold">DemoSeoTestimonials</h2>
            <div v-for="testimonial in provider.testimonials" :key="testimonial.quote" class="rounded-xl border border-default p-4">
              <p class="text-sm leading-6 text-toned">"{{ testimonial.quote }}"</p>
              <p v-if="testimonial.name || testimonial.company" class="mt-3 text-sm text-dimmed">
                {{ [testimonial.name, testimonial.company].filter(Boolean).join(' · ') }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard id="enquire">
          <div class="space-y-4">
            <div class="space-y-2">
              <h2 class="text-2xl font-semibold">Request a quote</h2>
              <p class="text-sm text-dimmed">
                Share the basics and we will route this straight to {{ provider.displayName }}.
              </p>
            </div>

            <UAlert
              v-if="submittedLead"
              :color="submissionColor"
              variant="soft"
              :title="submissionTitle"
              :description="successMessage"
            />

            <form class="space-y-4" @submit.prevent="handleSubmit">
              <UFormField label="Name" required>
                <UInput v-model="draft.contactName" placeholder="Your name" />
              </UFormField>
              <UFormField label="Email" required>
                <UInput v-model="draft.contactEmail" type="email" placeholder="you@company.com" />
              </UFormField>
              <UFormField label="Company" required>
                <UInput v-model="draft.companyName" placeholder="Your company" />
              </UFormField>
              <UFormField label="Website">
                <UInput v-model="draft.websiteUrl" placeholder="https://example.com" />
              </UFormField>
              <UFormField label="Sector">
                <UInput v-model="draft.sector" placeholder="e.g. SaaS, eCommerce, Finance" />
              </UFormField>
              <UFormField label="Budget range" required>
                <UInput v-model="draft.budgetRange" placeholder="e.g. GBP5k / month" />
              </UFormField>
              <UFormField label="Timeline" required>
                <UInput v-model="draft.timeline" placeholder="e.g. Need support in the next 30 days" />
              </UFormField>
              <UFormField label="Project summary" required>
                <UTextarea
                  v-model="draft.projectSummary"
                  :rows="5"
                  placeholder="Share the site, challenge, and what success should look like."
                />
              </UFormField>

              <label class="flex items-start gap-3 text-sm">
                <input v-model="draft.consentContact" type="checkbox" class="mt-1" />
                <span>I am happy for Find My SEO to pass this enquiry to the provider.</span>
              </label>

              <UButton block color="primary" type="submit">
                Send enquiry
              </UButton>
            </form>
          </div>
        </UCard>

        <UCard>
          <div class="space-y-3">
            <h2 class="text-xl font-semibold">Engagement fit</h2>
            <p class="text-sm text-toned">
              {{ provider.displayName }} typically works on {{ provider.projectTypes.join(' and ').toLowerCase() }}
              engagements and is currently {{ provider.availabilityStatus.toLowerCase() }}.
            </p>
            <UButton
              v-if="provider.contactEmail"
              :to="emailDirectHref"
              target="_blank"
              variant="soft"
              icon="i-lucide-mail"
            >
              Email directly
            </UButton>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>

  <UPage v-else>
    <UPageHeader title="Provider not found" description="This SEO provider is unavailable." />
    <UPageBody>
      <UButton to="/professionals" color="primary">Back to directory</UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { DemoSeoLeadDraft } from '../../../../../../demo/find-my-seo.demo'
import { demoSeoCaseStudiesForProvider, demoSeoProviderLabel, findDemoSeoProviderBySlug } from '../../../../../../demo/find-my-seo.demo'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const provider = computed(() => findDemoSeoProviderBySlug(slug.value))
const caseStudies = computed(() =>
  provider.value ? demoSeoCaseStudiesForProvider(provider.value.id) : []
)
const { submitLead } = useFindMySeoLeads()

const submittedLead = ref(false)
const successMessage = ref('')
const submissionColor = ref<'success' | 'warning'>('success')
const submissionTitle = ref('Enquiry captured')
const draft = reactive<DemoSeoLeadDraft>({
  contactName: '',
  contactEmail: '',
  companyName: '',
  websiteUrl: '',
  sector: '',
  projectSummary: '',
  budgetRange: '',
  timeline: '',
  consentContact: true,
})

const providerTypeLabel = computed(() =>
  provider.value ? demoSeoProviderLabel(provider.value) : 'Provider'
)
const primaryMediaUrl = computed(() => {
  if (!provider.value) {
    return ''
  }

  return provider.value.avatarUrl || provider.value.logoUrl || ''
})
const primaryMediaIcon = computed(() => 'i-lucide-user')
const brandLogoUrl = computed(() => {
  if (!provider.value?.logoUrl || provider.value.logoUrl === primaryMediaUrl.value) {
    return ''
  }

  return provider.value.logoUrl
})

const emailDirectHref = computed(() => {
  if (!provider.value?.contactEmail) {
    return undefined
  }

  const subject = encodeURIComponent(`Find My SEO enquiry for ${provider.value.displayName}`)
  const body = encodeURIComponent(
    [
      `Hi ${provider.value.displayName},`,
      '',
      draft.projectSummary || 'I found your profile on Find My SEO and would like to discuss a project.',
      '',
      draft.companyName ? `Company: ${draft.companyName}` : '',
      draft.budgetRange ? `Budget: ${draft.budgetRange}` : '',
      draft.timeline ? `Timeline: ${draft.timeline}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  )

  return `mailto:${provider.value.contactEmail}?subject=${subject}&body=${body}`
})

const resetDraft = () => {
  draft.contactName = ''
  draft.contactEmail = ''
  draft.companyName = ''
  draft.websiteUrl = ''
  draft.sector = ''
  draft.projectSummary = ''
  draft.budgetRange = ''
  draft.timeline = ''
  draft.consentContact = true
}

const handleSubmit = () => {
  if (!provider.value) {
    return
  }

  if (
    !draft.contactName.trim() ||
    !draft.contactEmail.trim() ||
    !draft.companyName.trim() ||
    !draft.projectSummary.trim() ||
    !draft.budgetRange.trim() ||
    !draft.timeline.trim() ||
    !draft.consentContact
  ) {
    submissionColor.value = 'warning'
    submissionTitle.value = 'Complete the form'
    successMessage.value = 'Please complete the required fields before sending your enquiry.'
    submittedLead.value = true
    return
  }

  const lead = submitLead(provider.value, draft)
  submittedLead.value = true
  submissionColor.value = lead.deliveryState === 'sent' ? 'success' : 'warning'
  submissionTitle.value = lead.deliveryState === 'sent' ? 'Enquiry captured' : 'Operator follow-up needed'
  successMessage.value =
    lead.deliveryState === 'sent'
      ? `Your enquiry is now in the operator inbox and ready to reach ${provider.value.displayName}.`
      : 'Your enquiry was saved, but direct email delivery needs operator follow-up.'
  resetDraft()
}

useSeoMeta({
  title: computed(() =>
    provider.value
      ? `${provider.value.displayName} | Find My SEO`
      : 'SEO provider | Find My SEO'
  ),
  description: computed(() => provider.value?.summary || 'SEO provider profile'),
})
</script>
