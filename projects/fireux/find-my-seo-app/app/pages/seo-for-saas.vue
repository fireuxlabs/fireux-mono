<template>
  <UPage>
    <UPageHeader
      title="Find SEO for SaaS"
      description="Use Find My SEO to compare SaaS-focused consultants and agencies with proof, commercial clarity, and a direct route to contact."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <p class="text-sm uppercase tracking-[0.18em] text-dimmed">Why this page exists</p>
          <h2 class="text-2xl font-semibold">SaaS SEO usually fails when traffic and pipeline get separated</h2>
          <p class="leading-7 text-toned">
            The best SaaS SEO providers understand buyer journeys, commercial intent, technical complexity, and the need to report beyond sessions.
            This page narrows Find My SEO to providers already positioned for that work.
          </p>
          <div class="flex gap-3">
            <UButton to="/seo-providers?sector=SaaS" color="primary">Browse SaaS SEO providers</UButton>
            <UButton to="/seo-providers" variant="soft">See all providers</UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'SEO for SaaS | Find My SEO',
  description: 'Compare SaaS-focused SEO consultants and agencies with proof and direct contact routes.',
})
</script>
