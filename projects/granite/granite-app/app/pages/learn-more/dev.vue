<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Granite Dev Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More: Dev</h1>
        <p class="fx-type-description text-toned">
          Operator reference for Granite portfolio entities and implementation
          surfaces.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/learn-more" color="primary" icon="i-lucide-book-open"
            >Public learn more</UButton
          >
          <UButton
            to="/pricing"
            color="neutral"
            variant="soft"
            icon="i-lucide-badge-dollar-sign"
            >Pricing</UButton
          >
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary entities</h2>
          </template>
          <ul class="list-disc fx-list-stack text-sm">
            <li>Portfolio, Property, Unit, Client</li>
            <li>ComplianceRecord</li>
            <li>Document, DocumentLink, Task</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Operational endpoints</h2>
          </template>
          <div class="space-y-2 text-sm">
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/free</p>
              <p class="text-dimmed">Functional Workspace access.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/your-app</p>
              <p class="text-dimmed">Branded App setup and monthly plan.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/business</p>
              <p class="text-dimmed">Managed product and assistance.</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'GraniteLearnMoreDevPage',
})

useSeoMeta({
  title: 'Learn More: Dev · Granite',
  description:
    'Operator reference for Granite entities, routes, and partner implementation.',
})
</script>
