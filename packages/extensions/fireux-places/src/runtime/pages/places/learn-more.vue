<template>
  <UPage>
    <UPageHeader
      title="FireUX Places"
      description="How Places help tenants share canonical locations."
    />

    <UPageBody class="pagebody">
      <section>
        <h2 class="fx-type-section-title">Why Places exists</h2>
        <p>
          Places is a shared, canonical location layer. A Place represents a
          real-world location (often backed by a Google Place ID) that other
          records (companies, kitchens, etc.) can attach to.
        </p>
      </section>

      <section>
        <h3 class="fx-type-card-title">Core capabilities today</h3>
        <ul>
          <li>
            <strong>Google-backed search</strong>
            &nbsp;— confirm a place once, then reuse it everywhere.
          </li>
          <li>
            <strong>Canonical IDs</strong>
            &nbsp;— place documents are keyed by a stable ID.
          </li>
          <li>
            <strong>Record-friendly</strong>
            &nbsp;— other domains can bind to a place without duplicating
            location data.
          </li>
        </ul>
      </section>

      <section>
        <h3 class="fx-type-card-title">Get started</h3>
        <div>
          <UButton to="/places/create" color="primary">Create a place</UButton>
          <UButton to="/places" variant="ghost">Browse places</UButton>
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
  title: 'Places · Learn more',
  description: 'About FireUX Places.',
  head: { title: 'Places · Learn more' },
  name: 'PlacesLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Places · Learn more` })
</script>
