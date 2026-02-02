<template>
  <UPage>
    <UPageHeader
      title="FireUX Kitchens"
      description="How Kitchen records attach to Places."
    />

    <UPageBody class="space-y-8">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why Kitchens exists</h2>
        <p class="text-sm text-gray-600">
          Kitchens are records bound to canonical Places. This keeps location data
          consistent while allowing kitchen-specific metadata (name, website)
          to live in its own document.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Core capabilities today</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>
            <strong class="font-medium text-gray-900">Place-bound records</strong>
            &nbsp;— create a kitchen from a confirmed place.
          </li>
          <li>
            <strong class="font-medium text-gray-900">Tenant-friendly</strong>
            &nbsp;— consistent kitchen documents across tenants.
          </li>
          <li>
            <strong class="font-medium text-gray-900">Editable metadata</strong>
            &nbsp;— update the kitchen name and website as needed.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Get started</h3>
        <div class="flex flex-wrap gap-2">
          <UButton to="/kitchens/create" color="primary">Create a kitchen</UButton>
          <UButton to="/kitchens" variant="ghost">Browse kitchens</UButton>
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
  title: 'Kitchens · Learn more',
  description: 'About FireUX Kitchens.',
  head: { title: 'Kitchens · Learn more' },
  name: 'KitchensLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Kitchens · Learn more` })
</script>
