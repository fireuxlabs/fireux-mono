<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Apps: Learn More"
      description="How FireUX apps are launched, operated, and scaled across ecosystems."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">What an app means in FireUX</h2>
        </template>

        <ul class="list-disc fx-list-stack">
          <li>An app is the operational product teams use day-to-day.</li>
          <li>
            Apps run with shared FireUX identity, runtime, and workspace
            conventions.
          </li>
          <li>
            Apps can run in an existing ecosystem, hosted by FireUX, or
            self-hosted.
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">App operating models</h2>
        </template>

        <div class="grid gap-3 md:grid-cols-3">
          <div class="fx-inset-panel">
            <p class="fx-type-caption">Join an ecosystem</p>
            <p class="fx-type-caption">
              Launch inside an ecosystem already operated by FireUX.
            </p>
          </div>
          <div class="fx-inset-panel">
            <p class="fx-type-caption">FireUX hosted</p>
            <p class="fx-type-caption">
              Run a new domain under FireUX hosting and operations.
            </p>
          </div>
          <div class="fx-inset-panel">
            <p class="fx-type-caption">Self hosted</p>
            <p class="fx-type-caption">
              You control infrastructure while FireUX supports the app runtime.
            </p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/apps" color="primary" icon="i-lucide-app-window">
          Open apps
        </UButton>
        <UButton
          to="/apps/learn-more/dev"
          color="neutral"
          variant="soft"
          icon="i-lucide-code-2"
        >
          Dev details
        </UButton>
        <UButton
          to="/pricing/your-app"
          color="neutral"
          variant="soft"
          icon="i-lucide-badge-dollar-sign"
        >
          App pricing
        </UButton>
        <UButton
          to="/get-started"
          color="neutral"
          variant="ghost"
          icon="i-lucide-rocket"
        >
          Get started
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'AppsLearnMorePage',
})

useSeoMeta({
  title: 'Apps: Learn More · FireUX',
  description: 'How FireUX apps are launched and operated across ecosystems.',
})
</script>
