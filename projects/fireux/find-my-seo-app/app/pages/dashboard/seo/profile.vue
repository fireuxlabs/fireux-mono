<template>
  <UPage>
    <UPageHeader
      title="Provider editor"
      description="Review and update provider listing content."
    />

    <UPageBody>
      <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <UCard v-if="provider">
          <form class="space-y-4">
            <UFormField label="Display name">
              <UInput :model-value="provider.displayName" />
            </UFormField>
            <UFormField label="Headline">
              <UInput :model-value="provider.headline" />
            </UFormField>
            <UFormField label="Summary">
              <UTextarea :model-value="provider.summary" :rows="5" />
            </UFormField>
            <UFormField label="Specialisms">
              <UInput :model-value="provider.specialisms.join(', ')" />
            </UFormField>
            <UFormField label="Services">
              <UInput :model-value="provider.servicesOffered.join(', ')" />
            </UFormField>
            <UFormField label="Pricing guidance">
              <UInput :model-value="provider.pricingGuidance" />
            </UFormField>
            <div class="grid gap-3 sm:grid-cols-2">
              <UFormField label="Featured">
                <UInput :model-value="provider.isFeatured ? 'Yes' : 'No'" />
              </UFormField>
              <UFormField label="Verified">
                <UInput :model-value="provider.isVerified ? 'Yes' : 'No'" />
              </UFormField>
            </div>
            <UFormField label="Trust note">
              <UTextarea :model-value="provider.trustNote" :rows="3" />
            </UFormField>
            <UFormField label="DemoSeoTestimonials">
              <UTextarea :model-value="testimonialPreview" :rows="5" />
            </UFormField>
            <UButton color="primary">Save listing</UButton>
          </form>
        </UCard>

        <FindmyseoProviderCard v-if="provider" :provider="provider" />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { demoSeoProviderList } from '../../../../../../../demo/find-my-seo.demo'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
})

const route = useRoute()

const provider = computed(() => {
  const slug = typeof route.query.provider === 'string' ? route.query.provider : ''
  return demoSeoProviderList.find((item) => item.slug === slug) ?? demoSeoProviderList[0]
})

const testimonialPreview = computed(() =>
  provider.value.testimonials
    .map((item) => [item.quote, [item.name, item.company].filter(Boolean).join(' · ')].filter(Boolean).join('\n'))
    .join('\n\n')
)
</script>
