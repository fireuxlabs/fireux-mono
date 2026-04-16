<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Ecosystems: Learn More (Dev)"
      description="Technical reference for ecosystem directory data and integration points."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Entity fields</h2>
        </template>

        <p class="text-sm text-dimmed">
          Ecosystem documents are read from
          <code>db.collections.ecosystem</code> and normalized for cards:
          <code>{ key, name, team, apps, src, text, href }</code>.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="rounded border border-default p-3">
            <p class="font-mono">Firestore collection: ecosystem</p>
            <p class="text-dimmed">
              Primary source for <code>/ecosystems</code> entity index.
            </p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">GET /api/registry</p>
            <p class="text-dimmed">
              Reads registry docs (modules, apps, ecosystems) for audit/debug
              flows.
            </p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">POST /api/registry</p>
            <p class="text-dimmed">
              Creates/updates ecosystem registry rows in controlled setup flows.
            </p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/ecosystems" color="primary" icon="i-lucide-orbit"
          >Open ecosystems</UButton
        >
        <UButton
          to="/ecosystems/learn-more"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
          >Public guide</UButton
        >
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  tag: 'ecosystems',
  layout: 'default',
  name: 'EcosystemsLearnMoreDevPage',
})

useSeoMeta({
  title: 'Ecosystems: Learn More (Dev) · FireUX',
  description:
    'Technical reference for FireUX ecosystem directory routes and data endpoints.',
})
</script>
