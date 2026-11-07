<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section>
      <UContainer>
        <UBadge color="primary" variant="soft">Bringli Dev Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More: Dev</h1>
        <p class="fx-type-description">
          Operator reference for Bringli entities, order flow, and partner
          implementation surfaces.
        </p>
        <div class="fx-card__actions">
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
      <UContainer>
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary entities</h2>
          </template>
          <ul class="fx-list-stack">
            <li>Supply-side and buyer-side profile records</li>
            <li>Catalog and order flow entities</li>
            <li>Fulfillment and tracking state records</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Operational endpoints</h2>
          </template>
          <div class="pagebody">
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /pricing/free</p>
              <p class="fx-type-body">Functional Workspace access.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /pricing/your-app</p>
              <p class="fx-type-body">Branded App setup and monthly plan.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /pricing/business</p>
              <p class="fx-type-body">Managed product and assistance.</p>
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
  name: 'BringliLearnMoreDevPage',
})

useSeoMeta({
  title: 'Learn More: Dev · Bringli',
  description:
    'Operator reference for Bringli entities, routes, and partner implementation.',
})
</script>
