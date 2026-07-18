<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Granite Dev Guide</UBadge>
        <h1 class="text-4xl font-semibold text-highlighted">Learn More: Dev</h1>
        <p class="text-lg text-toned">
          Operator reference for Granite portfolio entities and implementation surfaces.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/learn-more" color="primary" icon="i-lucide-book-open">Public learn more</UButton>
          <UButton to="/pricing/partners" color="neutral" variant="soft" icon="i-lucide-handshake">Partner model</UButton>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Primary entities</h2>
          </template>
          <ul class="list-disc space-y-2 pl-5 text-sm">
            <li>Portfolio, Property, Unit, Client</li>
            <li>ComplianceRecord</li>
            <li>Document, DocumentLink, Task</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Operational endpoints</h2>
          </template>
          <div class="space-y-2 text-sm">
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/users</p>
              <p class="text-dimmed">User access model for ecosystem onboarding.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/apps</p>
              <p class="text-dimmed">App setup and maintenance model.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/partners</p>
              <p class="text-dimmed">Partner economics and operator route.</p>
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
  description: 'Operator reference for Granite entities, routes, and partner implementation.',
})
</script>
