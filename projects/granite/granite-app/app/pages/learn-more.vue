<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section>
      <UContainer>
        <UBadge color="primary" variant="soft">Granite Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More</h1>
        <p class="fx-type-description">
          Granite provides portfolio oversight with structured control across
          properties, compliance, documents, incidents, and financial signals.
        </p>
        <div class="fx-card__actions">
          <UButton to="/about" color="primary" icon="i-lucide-info"
            >About</UButton
          >
          <UButton
            to="/pricing"
            color="neutral"
            variant="soft"
            icon="i-lucide-badge-dollar-sign"
            >Pricing</UButton
          >
          <UButton
            to="/get-started"
            color="neutral"
            variant="ghost"
            icon="i-lucide-rocket"
            >Get started</UButton
          >
          <UButton
            to="/learn-more/dev"
            color="neutral"
            variant="soft"
            icon="i-lucide-code-2"
            >Dev</UButton
          >
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Core concepts</h2>
          </template>
          <ul class="fx-list-stack">
            <li>
              Portfolios are the operational center for property strategy and
              control.
            </li>
            <li>
              Properties, compliance, documents, and incidents feed one
              management surface.
            </li>
            <li>Financial signals help teams prioritize risk and execution.</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary surfaces</h2>
          </template>
          <div class="fx-card__actions">
            <UButton
              to="/workspace/portfolio"
              color="primary"
              variant="soft"
              icon="i-lucide-terminal"
              >Portfolio workspace</UButton
            >
            <UButton
              to="/pricing/your-app"
              color="neutral"
              variant="soft"
              icon="i-lucide-app-window"
              >Your App</UButton
            >
            <UButton
              to="/pricing"
              color="neutral"
              variant="soft"
              icon="i-lucide-badge-dollar-sign"
              >Pricing</UButton
            >
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
  description:
    'Guide to Granite portfolio concepts, pricing paths, and workspace routes.',
})
</script>
