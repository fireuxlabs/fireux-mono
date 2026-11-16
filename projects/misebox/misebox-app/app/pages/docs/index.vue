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
useSeoMeta({
  title: 'Developer docs · Misebox',
  description:
    'Build Misebox Apps with supported configuration, domain components and explicit data boundaries.',
})
</script>
