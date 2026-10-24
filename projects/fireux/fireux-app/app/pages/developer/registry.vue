<template>
  <main class="registry-doc">
    <header>
      <p class="eyebrow fx-type-headline">Developer Docs</p>
      <h1 class="fx-type-page-title">Directory Projection Access</h1>
      <p class="fx-type-description">
        FireUX exposes an allowlisted public App and Ecosystem directory. The
        old mixed Firestore registry API is retired.
      </p>
    </header>

    <section class="content fx-type-body">
      <h2 class="fx-type-card-title">Where to grab the data</h2>
      <p>
        Use the dedicated Dev Tool at
        <NuxtLink to="/diagnostics/registry">/diagnostics/registry</NuxtLink> to copy the
        combined <code>apps</code> and <code>ecosystems</code> projection. It calls
        <code>/api/directory</code> and exposes the response as a
        formatted JSON block with a copy helper.
      </p>

      <h2 class="fx-type-card-title">Why split docs vs. tools?</h2>
      <ul>
        <li>Developer pages stay focused on explanations and onboarding.</li>
        <li>
          Dev tools favor pragmatic JSON blocks, clipboard buttons, and raw
          data.
        </li>
        <li>Linking the two keeps context close without mixing formats.</li>
      </ul>

      <h2 class="fx-type-card-title">Workflow reminder</h2>
      <ol>
        <li>
          Read package identity and metadata from <code>package.json</code>.
          App and Ecosystem records own their directory identity.
        </li>
        <li>Visit <code>/diagnostics/registry</code> and copy the payload.</li>
        <li>Use that JSON for public projection and parity checks only.</li>
      </ol>
    </section>
  </main>
</template>

<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->

<script setup lang="ts">
useSeoMeta({
  title: 'FireUX Directory Docs',
  description:
    'Documentation for inspecting the allowlisted App and Ecosystem directory projection.',
})

definePageMeta({
  nav: {
    key: 'developer-registry-docs',
    label: 'Directory Docs',
    icon: 'i-lucide-book-open-check',
    desktop: false,
    mobile: false,
  },
})
</script>

<style scoped>
.registry-doc {
  max-width: 820px;
  margin: 0 auto;
  padding: calc(var(--spacing) * 12) calc(var(--spacing) * 6) calc(var(--spacing) * 16);
  display: grid;
  gap: calc(var(--spacing) * 8);
}
.eyebrow {
  color: var(--ui-text-muted);
}
header h1 {
  margin-bottom: calc(var(--spacing) * 2);
}
header p {
  max-width: 60ch;
}
.content {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.content ul,
.content ol {
  margin-left: calc(var(--spacing) * 5);
  display: grid;
  gap: calc(var(--spacing) * 2);
}
.content code {
  background: var(--ui-bg-muted);
  padding: 0.1em 0.3em;
  border-radius: var(--ui-radius);
  font-family: var(--font-mono);
  /* Inline code follows its surrounding prose with a deliberate optical trim. */
  font-size: 0.95em;
}
</style>
