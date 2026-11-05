<template>
  <UPage>
    <UPageHeader
      title="FireUX Businesses"
      description="How Business records attach to Places."
    />

    <UPageBody class="pagebody">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why Businesses exists</h2>
        <p class="text-sm text-toned">
          Businesses are records bound to canonical Places. This keeps location data
          consistent while allowing business-specific metadata (name, website)
          to live in its own document.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Core capabilities today</h3>
        <ul class="space-y-2 text-sm text-toned">
          <li>
            <strong class="font-medium text-highlighted">Place-bound records</strong>
            &nbsp;— create a business from a confirmed place.
          </li>
          <li>
            <strong class="font-medium text-highlighted">Tenant-friendly</strong>
            &nbsp;— consistent business documents across tenants.
          </li>
          <li>
            <strong class="font-medium text-highlighted">Editable metadata</strong>
            &nbsp;— update the business name and website as needed.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Get started</h3>
        <div class="flex flex-wrap gap-2">
          <UButton to="/businesses/create" color="primary">Create a business</UButton>
          <UButton to="/businesses" variant="ghost">Browse businesses</UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Businesses · Learn more',
  description: 'About FireUX Businesses.',
  head: { title: 'Businesses · Learn more' },
  name: 'BusinessesLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Businesses · Learn more` })
</script>
