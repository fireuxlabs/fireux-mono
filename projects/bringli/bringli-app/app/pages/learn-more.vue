<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Bringli Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More</h1>
        <p class="fx-type-description text-toned">
          Bringli coordinates supply flow between producers and buyers with clear order and fulfillment operations.
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
            <h2 class="fx-type-card-heading">Core concepts</h2>
          </template>
          <ul class="list-disc fx-list-stack text-sm">
            <li>Supply relationships need clear records for buyers, producers, and orders.</li>
            <li>Order flow should remain structured from request to fulfillment.</li>
            <li>Console-first operations reduce manual overhead and coordination drift.</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary surfaces</h2>
          </template>
          <div class="flex flex-wrap gap-2">
            <UButton to="/pricing/your-app" color="primary" variant="soft" icon="i-lucide-app-window">Your App</UButton>
            <UButton to="/pricing" color="neutral" variant="soft" icon="i-lucide-badge-dollar-sign">Pricing</UButton>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'BringliLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · Bringli',
  description: 'Guide to Bringli concepts, pricing paths, and operational flow.',
})
</script>
