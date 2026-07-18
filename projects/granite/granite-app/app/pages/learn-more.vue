<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Granite Guide</UBadge>
        <h1 class="text-4xl font-semibold text-highlighted">Learn More</h1>
        <p class="text-lg text-toned">
          Granite provides portfolio oversight with structured control across properties, compliance, documents, incidents, and financial signals.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/about" color="primary" icon="i-lucide-info">About</UButton>
          <UButton to="/pricing" color="neutral" variant="soft" icon="i-lucide-badge-dollar-sign">Pricing</UButton>
          <UButton to="/get-started" color="neutral" variant="ghost" icon="i-lucide-rocket">Get started</UButton>
          <UButton to="/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">Dev</UButton>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Core concepts</h2>
          </template>
          <ul class="list-disc space-y-2 pl-5 text-sm">
            <li>Portfolios are the operational center for property strategy and control.</li>
            <li>Properties, compliance, documents, and incidents feed one management surface.</li>
            <li>Financial signals help teams prioritize risk and execution.</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Primary surfaces</h2>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton to="/console/portfolio" color="primary" variant="soft" icon="i-lucide-terminal">Portfolio console</UButton>
            <UButton to="/pricing/apps" color="neutral" variant="soft" icon="i-lucide-app-window">App model</UButton>
            <UButton to="/pricing/partners" color="neutral" variant="soft" icon="i-lucide-handshake">Partners</UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'GraniteLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · Granite',
  description: 'Guide to Granite portfolio concepts, pricing paths, and console routes.',
})
</script>
