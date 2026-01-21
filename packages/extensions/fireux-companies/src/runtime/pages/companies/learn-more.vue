<template>
  <UPage>
    <UPageHeader
      title="FireUX Companies"
      description="How Company overlays attach to Places."
    />

    <UPageBody class="space-y-8">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why Companies exists</h2>
        <p class="text-sm text-gray-600">
          Companies are overlays bound to canonical Places. This keeps location data
          consistent while allowing company-specific metadata (name, website)
          to live in its own document.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Core capabilities today</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>
            <strong class="font-medium text-gray-900">Place-bound overlays</strong>
            &nbsp;— create a company from a confirmed place.
          </li>
          <li>
            <strong class="font-medium text-gray-900">Tenant-friendly</strong>
            &nbsp;— consistent company documents across tenants.
          </li>
          <li>
            <strong class="font-medium text-gray-900">Editable metadata</strong>
            &nbsp;— update the company name and website as needed.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Get started</h3>
        <div class="flex flex-wrap gap-2">
          <UButton to="/companies/create" color="primary">Create a company</UButton>
          <UButton to="/companies" variant="ghost">Browse companies</UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Companies · Learn more',
  description: 'About FireUX Companies.',
  head: { title: 'Companies · Learn more' },
  name: 'CompaniesLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Companies · Learn more` })
</script>
