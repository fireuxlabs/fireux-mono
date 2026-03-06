<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Misebox Guide</UBadge>
        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">Learn More</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Misebox is the operating system for kitchens and professionals. This page maps the core routes and next actions.
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
            <li>Kitchen operations: menus, dishes, recipes, prep, and service readiness.</li>
            <li>Team operations: staffing flow and handover inside the kitchen workspace.</li>
            <li>Recruitment flow: connect kitchens with professionals through one ecosystem.</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Primary surfaces</h2>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton to="/console/kitchen" color="primary" variant="soft" icon="i-lucide-terminal">Kitchen console</UButton>
            <UButton to="/pricing/apps" color="neutral" variant="soft" icon="i-lucide-app-window">App model</UButton>
            <UButton to="/pricing/resellers" color="neutral" variant="soft" icon="i-lucide-handshake">Resellers</UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · Misebox',
  description: 'Guide to Misebox concepts, pricing paths, and kitchen console surfaces.',
})
</script>
