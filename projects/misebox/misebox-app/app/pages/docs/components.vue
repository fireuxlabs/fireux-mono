<template>
  <UPage>
    <UPageHeader
      title="Misebox components"
      description="A small, reviewed reference for hospitality presentation and its complete consuming compositions."
    />
    <UPageBody>
      <UNavigationMenu
        :items="miseboxDocsNavigation"
        aria-label="Misebox documentation"
      />
      <p>
        These examples use supplied text and local state. They do not read a
        Kitchen, sign in, call a provider or save anything.
      </p>
      <DocsComponentExamples />
      <DocsCompositionReferences />
      <UAlert
        title="A reference, not an internal inventory"
        description="Registration makes a component available; it does not publish every implementation file as a supported API. Unlisted components need an owner and consumer review before reuse."
        color="neutral"
        variant="soft"
      />
      <p>
        Basic controls belong to
        <ULink to="https://ui.nuxt.com/docs/components">Nuxt UI</ULink>. Shared
        platform controls belong in the
        <ULink to="https://fireux.app/docs/components">FireUX library</ULink>.
        Kitchen and Menu records, readers and protected commands remain with
        their domain owners.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { miseboxDocsNavigation } from '../../content/docs'
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Component reference · Misebox',
  description:
    'Safe supplied-data examples and source-backed Public and Workspace composition references for Misebox developers.',
})
</script>
