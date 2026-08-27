<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: retain the former route only as a permanent redirect. -->
<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Home </UButton>
        <UPageHeader
          title="Cleaning moved to Werkbox"
          description="Cleaning is now a category in the shared Werkbox practical-work hub."
        />
        <UPageBody class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <UButton
              to="/ecosystems/werkbox/cleaning"
              icon="i-lucide-arrow-right"
            >
              Continue to Werkbox cleaning
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Cleaning on Werkbox · FireUX',
  description:
    'Cleaning is a category in the shared Werkbox practical-work hub.',
})

await navigateTo('/ecosystems/werkbox/cleaning', {
  redirectCode: 301,
  replace: true,
})
</script>
