<template>
  <UPage>
    <UPageHeader
      title="Case studies"
      description="Review and maintain structured proof for provider outcomes."
    />

    <UPageBody>
      <div class="space-y-4">
        <UCard v-for="study in demoSeoCaseStudyList" :key="study.id">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              <p class="text-lg font-semibold">{{ study.title }}</p>
              <p class="text-sm text-dimmed">{{ ownerName(study.ownerEntityId) }} · {{ study.clientType }} · {{ study.timeframeLabel }}</p>
              <p class="text-sm leading-6 text-toned">{{ study.problem }}</p>
            </div>
            <div class="flex gap-3">
              <UButton variant="soft">Edit</UButton>
              <UButton variant="ghost">Preview</UButton>
            </div>
          </div>
        </UCard>

        <UButton color="primary">Add case study</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { demoSeoCaseStudyList, demoSeoProviderList } from '../../../../../../../demo/find-my-seo.demo'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
})

const ownerName = (providerId: string) =>
  demoSeoProviderList.find((provider) => provider.id === providerId)?.displayName ?? 'SEO provider'
</script>
