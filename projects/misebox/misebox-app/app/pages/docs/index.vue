<template>
  <UPage>
    <UPageHeader
      title="Build with Misebox"
      description="Developer guidance for composing a Misebox App, its public experience and Kitchen Workspace."
    />
    <UPageBody>
      <UNavigationMenu
        :items="miseboxDocsNavigation"
        aria-label="Misebox documentation"
      />
      <p class="fx-type-body">
        Inspect Misebox's <ULink to="/meta">public metadata</ULink> or
        <ULink to="/api/app/meta" target="_blank" rel="noopener noreferrer"
          >read the JSON response</ULink
        >
        for its published copy, search defaults and legal notices. Individual
        pages keep their own content and metadata.
      </p>
      <DocsSetup />
      <DocsArchitecture />
      <section aria-labelledby="docs-foundations">
        <h2 id="docs-foundations" class="fx-type-section-title">
          Go deeper with the owning library
        </h2>
        <p>
          Misebox documents its hospitality composition. FireUX and the upstream
          projects document the lower foundations.
        </p>
        <UPageGrid>
          <UPageCard
            v-for="resource in miseboxDocsResources"
            :key="resource.to"
            v-bind="resource"
            variant="subtle"
          />
        </UPageGrid>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { miseboxDocsNavigation, miseboxDocsResources } from '../../content/docs'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'docs',
    label: 'Developer docs',
    icon: 'i-lucide-book-open',
    order: 80,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})
useSeo({
  title: 'Developer docs · Misebox',
  description:
    'Build Misebox Apps with supported configuration, domain components and explicit data boundaries.',
  path: '/docs',
  image: '/img/app/cover.png',
})
</script>
