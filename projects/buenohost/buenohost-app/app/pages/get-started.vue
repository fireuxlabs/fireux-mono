<template>
  <UPage>
        <UButton to="/" variant="link"> BuenoHost </UButton>
        <UPageHeader
          title="Get Started"
          description="Create a QR-ready stay companion for guests."
        />
        <UPageBody>
          <section class="pagebody">
            <ol class="list-decimal fx-list-stack">
              <li>Choose a property or stay experience.</li>
              <li>
                Add the information guests need before and during the stay.
              </li>
              <li>Share the public guide with a QR code.</li>
            </ol>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/workspace/property" icon="i-lucide-house" size="lg">
              Open Property Workspace
            </UButton>
          </div>
        </UPageBody>
      </UPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Get Started - BuenoHost',
  description:
    'Start with BuenoHost by creating a QR-ready stay companion for guests.',
})
</script>
