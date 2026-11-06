<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Ecosystems: Learn More (Dev)"
      description="Technical reference for ecosystem directory data and integration points."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">Entity fields</h2>
        </template>

        <p class="fx-type-caption">
          Canonical Ecosystem documents are projected into an allowlisted
          directory shape:
          <code
            >{ id, project_id, status, name, description, image_url,
            website_url, detail_url, app_count }</code
          >.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">Primary endpoints</h2>
        </template>

        <div class="space-y-2">
          <div class="fx-inset-panel">
            <p class="fx-type-code">GET /api/directory</p>
            <p class="fx-type-body">
              Shared platform projection for the landing page and
              <code>/ecosystems</code>.
            </p>
          </div>
          <div class="fx-inset-panel">
            <p class="fx-type-code">GET/POST /api/registry · retired</p>
            <p class="fx-type-body">
              The mixed registry database is not an entity or directory
              authority. Publication belongs to the projection pipeline.
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
