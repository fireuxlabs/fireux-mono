<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Cleanbox Guide</UBadge>
        <h1 class="text-4xl font-semibold text-highlighted">Learn More</h1>
        <p class="text-lg text-toned">
          Cleanbox is built for structured cleaning operations: locations, jobs, teams, and quality control in one flow.
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
            <li>Service locations are the operational anchor for planning and delivery.</li>
            <li>Job flow tracks assignment, execution, and completion evidence.</li>
            <li>Quality and reliability improve when operations run from one system.</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Primary surfaces</h2>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton to="/pricing/apps" color="primary" variant="soft" icon="i-lucide-app-window">App model</UButton>
            <UButton to="/pricing/users" color="neutral" variant="soft" icon="i-lucide-users">User access</UButton>
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
  name: 'CleanboxLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · Cleanbox',
  description: 'Guide to Cleanbox concepts, pricing paths, and operational flow.',
})
</script>
