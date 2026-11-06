<template>
  <UPage>
    <UPageHeader
      title="Find SEO for eCommerce"
      description="Compare eCommerce SEO providers who understand category growth, merchandising, technical fixes, and revenue-led search strategy."
    />

    <UPageBody>
      <UCard>
        <div class="fx-card-body-stack">
          <p class="fx-type-headline">Why this page exists</p>
          <h2 class="fx-type-section-title">
            eCommerce SEO needs category thinking, not generic traffic promises
          </h2>
          <p class="fx-type-body">
            Good eCommerce SEO connects search demand to category structure,
            internal linking, merchandising, and commercial priorities. This
            landing page sends buyers straight into the providers already
            strongest in that work.
          </p>
          <div class="fx-card__actions">
            <UButton to="/get-started" color="primary"
              >Browse eCommerce SEO providers</UButton
            >
            <UButton to="/get-started" variant="soft"
              >See all providers</UButton
            >
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'SEO for eCommerce | Find My SEO',
  description:
    'Compare eCommerce SEO consultants and agencies with category, technical, and commercial proof.',
})
</script>
