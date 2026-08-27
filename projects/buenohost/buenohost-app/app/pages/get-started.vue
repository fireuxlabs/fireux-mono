<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> BuenoHost </UButton>
        <UPageHeader
          title="Get Started"
          description="Create a QR-ready stay companion for guests."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <ol class="list-decimal fx-list-stack text-muted">
              <li>Choose a property or stay experience.</li>
              <li>
                Add the information guests need before and during the stay.
              </li>
              <li>Share the public guide with a QR code.</li>
            </ol>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" icon="i-lucide-qr-code" size="lg">
              View BuenoHost
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
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
