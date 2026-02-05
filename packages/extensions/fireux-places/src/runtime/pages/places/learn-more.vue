<template>
  <UPage>
    <UPageHeader
      title="FireUX Places"
      description="How Places help tenants share canonical locations."
    />

    <UPageBody class="pagebody">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why Places exists</h2>
        <p class="text-sm text-gray-600">
          Places is a shared, canonical location layer. A Place represents a real-world
          location (often backed by a Google Place ID) that other records (companies,
          kitchens, etc.) can attach to.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Core capabilities today</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>
            <strong class="font-medium text-gray-900">Google-backed search</strong>
            &nbsp;— confirm a place once, then reuse it everywhere.
          </li>
          <li>
            <strong class="font-medium text-gray-900">Canonical IDs</strong>
            &nbsp;— place documents are keyed by a stable ID.
          </li>
          <li>
            <strong class="font-medium text-gray-900">Record-friendly</strong>
            &nbsp;— other domains can bind to a place without duplicating location data.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Get started</h3>
        <div class="flex flex-wrap gap-2">
          <UButton to="/places/create" color="primary">Create a place</UButton>
          <UButton to="/places" variant="ghost">Browse places</UButton>
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
  title: 'Places · Learn more',
  description: 'About FireUX Places.',
  head: { title: 'Places · Learn more' },
  name: 'PlacesLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Places · Learn more` })
</script>
