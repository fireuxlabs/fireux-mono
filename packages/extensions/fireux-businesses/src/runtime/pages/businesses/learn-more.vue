<template>
  <UPage>
    <UPageHeader
      title="FireUX Businesses"
      description="How Business records attach to Places."
    />

    <UPageBody class="pagebody">
      <section>
        <h2 class="fx-type-section-title">Why Businesses exists</h2>
        <p>
          Businesses are records bound to canonical Places. This keeps location
          data consistent while allowing business-specific metadata (name,
          website) to live in its own document.
        </p>
      </section>

      <section>
        <h3 class="fx-type-card-title">Core capabilities today</h3>
        <ul>
          <li>
            <strong>Place-bound records</strong>
            &nbsp;— create a business from a confirmed place.
          </li>
          <li>
            <strong>Tenant-friendly</strong>
            &nbsp;— consistent business documents across tenants.
          </li>
          <li>
            <strong>Editable metadata</strong>
            &nbsp;— update the business name and website as needed.
          </li>
        </ul>
      </section>

      <section>
        <h3 class="fx-type-card-title">Get started</h3>
        <div>
          <UButton to="/businesses/create" color="primary"
            >Create a business</UButton
          >
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
