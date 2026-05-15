<template>
  <UPage>
    <UPageHeader
      title="Provider Dashboard"
      description="Manage the profile that search-led pages surface."
    >
      <template #links>
        <UButton to="/professionals" color="primary" icon="i-lucide-search">
          View marketplace
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Demo dashboard"
        description="Curated demo data only. No projects, payments, contracts, or console family."
      />

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard v-for="metric in metrics" :key="metric.label">
          <div class="space-y-2">
            <p class="text-sm text-dimmed">{{ metric.label }}</p>
            <p class="text-3xl font-semibold">{{ metric.value }}</p>
            <p class="text-sm text-toned">{{ metric.copy }}</p>
          </div>
        </UCard>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold">Profile completeness</p>
                <p class="text-sm text-dimmed">Keep the public provider profile sharp.</p>
              </div>
              <UBadge color="success" variant="soft">Demo ready</UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div v-for="item in checklist" :key="item.label" class="flex items-start gap-3 rounded-md border border-default p-3">
              <UIcon :name="item.done ? 'i-lucide-check-circle' : 'i-lucide-circle'" class="mt-0.5 text-primary" />
              <div>
                <p class="font-medium">{{ item.label }}</p>
                <p class="text-sm text-dimmed">{{ item.copy }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <p class="text-sm font-semibold">Profile preview</p>
          </template>
          <FindmyseoProviderCard :provider="provider" />
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard v-for="section in sections" :key="section.title">
          <div class="space-y-3">
            <UIcon :name="section.icon" class="size-5 text-primary" />
            <p class="text-lg font-semibold">{{ section.title }}</p>
            <p class="text-sm leading-6 text-toned">{{ section.copy }}</p>
            <UButton :to="section.to" variant="soft">{{ section.cta }}</UButton>
          </div>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { demoSeoCaseStudyList, demoSeoLeadInbox, demoSeoProviderList } from '../../../../../../../demo/find-my-seo.demo'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'provider-dashboard',
    label: 'Provider Dashboard',
    icon: 'i-lucide-layout-dashboard',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

const provider = computed(() => demoSeoProviderList[0])

const metrics = computed(() => [
  {
    label: 'Profile strength',
    value: '92%',
    copy: 'Services, sectors and proof are ready.',
  },
  {
    label: 'Demo leads',
    value: String(demoSeoLeadInbox.length),
    copy: 'Example enquiries for review.',
  },
  {
    label: 'Case studies',
    value: String(demoSeoCaseStudyList.length),
    copy: 'Proof records for profiles.',
  },
])

const checklist = [
  {
    label: 'Headline and positioning',
    copy: 'Say who they help.',
    done: true,
  },
  {
    label: 'Services and specialisms',
    copy: 'Make filtering easy.',
    done: true,
  },
  {
    label: 'Case studies',
    copy: 'Show problem, action and result.',
    done: true,
  },
  {
    label: 'Leads and enquiries',
    copy: 'Keep routing for later.',
    done: false,
  },
]

const sections = [
  {
    title: 'Edit profile',
    copy: 'Update headline, services and availability.',
    to: '/dashboard/seo/profile',
    cta: 'Open profile editor',
    icon: 'i-lucide-user-pen',
  },
  {
    title: 'Case studies',
    copy: 'Review proof records.',
    to: '/case-studies',
    cta: 'View proof',
    icon: 'i-lucide-badge-check',
  },
  {
    title: 'Leads',
    copy: 'Preview enquiry handling.',
    to: '/dashboard/seo/leads',
    cta: 'Open leads',
    icon: 'i-lucide-mail-plus',
  },
]

useSeoMeta({
  title: 'Provider Dashboard | Find My SEO',
  description: 'Provider dashboard for profile, proof, and lead placeholders.',
})
</script>
