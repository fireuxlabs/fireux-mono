<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Modules: Learn More (Dev)"
      description="Technical reference for source-controlled module packages and App configuration."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">Source authority</h2>
        </template>

        <ul class="fx-list-stack">
          <li>
            Module identity and metadata live with each source-controlled
            extension package and its <code>package.json</code>.
          </li>
          <li>
            Apps select the modules they use through their FireUX configuration.
          </li>
          <li>
            The module index is an authored public projection of reusable
            packages under <code>packages/extensions/fireux-*</code>.
          </li>
          <li>Module detail route is exposed as <code>/modules/[id]</code>.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">Authority boundary</h2>
        </template>

        <div class="pagebody">
          <div class="fx-inset-panel">
            <p class="fx-type-code">GET/POST /api/registry · retired</p>
            <p class="fx-type-body">
              Module package metadata is not App/Ecosystem directory truth.
            </p>
          </div>
        </div>
      </UCard>

      <div class="fx-card__actions">
        <UButton to="/modules" color="primary" icon="i-lucide-puzzle"
          >Open modules</UButton
        >
        <UButton
          to="/modules/learn-more"
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
  tag: 'modules',
  layout: 'default',
  name: 'ModulesLearnMoreDevPage',
})

useSeoMeta({
  title: 'Modules: Learn More (Dev) · FireUX',
  description:
    'Technical reference for source-controlled FireUX module packages and routes.',
})
</script>
