<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="FireUX Blank"
      description="A clean app for testing the console spine with no domain baggage."
    >
      <template #links>
        <UButton to="/console/blank" icon="i-lucide-circle-play">
          Open blank console
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard
        title="What this app is"
        description="Blank is a harness app. It tests whether a console can exist cleanly before Kitchen, Project, Supplier, Portfolio, or Property plug into it."
        variant="subtle"
      />

      <UPageCard variant="subtle">
        <template #header>
          <div>
            <h2 class="text-base font-semibold">Hard limits</h2>
            <p class="text-sm text-dimmed">These are intentional.</p>
          </div>
        </template>

        <ul class="space-y-2 text-sm text-muted">
          <li>No domain entity.</li>
          <li>No Firestore collection.</li>
          <li>No demo mode.</li>
          <li>No test mode.</li>
          <li>No operations folder.</li>
          <li>No child records.</li>
        </ul>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'blank-home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'FireUX Blank',
  description:
    'A clean app for testing the FireUX console spine without domain baggage.',
})
</script>
