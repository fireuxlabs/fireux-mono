<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the cleaning search-intent sales page. -->
<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: limit sales copy to current shared foundations. -->
<template>
  <SolutionPage
    title="App for a cleaning business"
    description="You probably do not need your own app yet. Start on Werkbox and see whether it gives your business what it needs."
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">Start shared</h2>
      </template>

      <div class="space-y-4 text-muted">
        <p>
          Explore cleaning through Werkbox before deciding whether your brand
          needs a separate app.
        </p>
        <ul class="fx-list-stack">
          <li>
            Use product-neutral Jobs classified with the
            <code>cleaning</code> category.
          </li>
          <li>Reuse shared Agent and Professional profile foundations.</li>
          <li>
            Keep Places and Companies independent of any one product name.
          </li>
        </ul>
      </div>
    </UCard>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">
        Move only when it makes sense
      </h2>
      <p class="text-muted">
        If Werkbox works for you and your own brand needs a separate home,
        launch a Werkbox App for CHF 600 setup.
      </p>
    </section>

    <template #actions>
      <UButton to="/ecosystems/werkbox/cleaning" icon="i-lucide-sparkles">
        See Werkbox cleaning
      </UButton>
      <UButton to="/apps/werkbox" color="neutral" variant="soft">
        View Werkbox
      </UButton>
    </template>
  </SolutionPage>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'landing',
  robots: 'noindex, nofollow',
})

useSeo({
  title: 'App for a Cleaning Business · FireUX',
  description:
    'Start your cleaning business on shared Werkbox, then move to a dedicated app only when you need one.',
  path: '/solutions/cleaning',
  image: '/img/app/cover.png',
  robots: 'noindex, nofollow',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})
</script>
