<template>
  <UPage>
    <UPageHeader
      title="Legal"
      description="Current FireUX legal documents and items that still require review."
    />

    <UPageBody class="pagebody">
      <section
        class="rounded-3xl border-2 border-error bg-error/10 p-6 shadow-lg shadow-error/10 sm:p-8"
        aria-labelledby="jobs-legal-review-title"
      >
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            class="flex size-14 shrink-0 items-center justify-center rounded-full bg-error text-inverted"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-scale" class="size-7" />
          </div>

          <div class="min-w-0 space-y-5">
            <div class="space-y-2">
              <UBadge color="error" variant="solid" size="lg">
                Legal review required
              </UBadge>
              <h2
                id="jobs-legal-review-title"
                class="text-2xl font-semibold text-error sm:text-3xl"
              >
                Swiss Jobs must not be treated as legally cleared
              </h2>
              <p class="max-w-3xl text-base leading-7 text-highlighted">
                Before paid or expanded Jobs activity launches in Misebox or
                Werkbox, obtain Swiss legal review and close the implementation
                gaps below. This notice records unresolved work; it is not legal
                advice or compliance certification.
              </p>
            </div>

            <ul class="grid gap-3 text-sm leading-6 text-highlighted md:grid-cols-2">
              <li v-for="item in jobsReviewItems" :key="item" class="flex gap-3">
                <UIcon
                  name="i-lucide-circle-alert"
                  class="mt-1 size-4 shrink-0 text-error"
                  aria-hidden="true"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="space-y-4" aria-labelledby="legal-documents-title">
        <div class="space-y-1">
          <h2 id="legal-documents-title" class="text-xl font-semibold">
            Legal documents
          </h2>
          <p class="text-sm text-muted">
            Read the current service, personal-data, and browser-storage terms.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <UPageCard
            v-for="document in legalDocuments"
            :key="document.to"
            :title="document.title"
            :description="document.description"
            :icon="document.icon"
            :to="document.to"
            variant="subtle"
          />
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const jobsReviewItems = [
  'Confirm the Swiss private-employment-placement licensing position before charging for temporary-placement capacity.',
  'Block public posting until any applicable Stellenmeldepflicht report and five-working-day hold are satisfied.',
  'Verify that each Job author is authorised to represent the named Company.',
  'Define and execute applicant-data retention, deletion, controller, recipient, and foreign-processing rules.',
  'Require the external employment contract, work-permit, GAV/NAV, working-time, and social-insurance handoff.',
  'Correct and validate Google JobPosting structured data for every public Job.',
] as const

const legalDocuments = [
  {
    title: 'Terms of Service',
    description: 'The terms governing FireUX-powered apps.',
    icon: 'i-lucide-file-text',
    to: '/legal/terms',
  },
  {
    title: 'Privacy Policy',
    description: 'How personal information is collected, used, and protected.',
    icon: 'i-lucide-shield-check',
    to: '/legal/privacy',
  },
  {
    title: 'Cookies and browser storage',
    description: 'The exact browser storage used after a feature request.',
    icon: 'i-lucide-cookie',
    to: '/legal/storage',
  },
] as const

definePageMeta({
  layout: 'default',
  title: 'Legal',
  description: 'FireUX legal documents and unresolved legal review items.',
  name: 'LegalIndexPage',
})

useSeoMeta({
  title: 'Legal · FireUX',
  description: 'FireUX legal documents and unresolved legal review items.',
})
</script>
