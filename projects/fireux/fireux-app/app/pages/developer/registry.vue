<template>
  <main class="registry-doc">
    <header>
      <p class="eyebrow">Developer Docs</p>
      <h1>Registry JSON Access</h1>
      <p>
        Narrative overview of how we expose registry payloads. This page keeps
        the human-readable context in the Developer stack, while the raw JSON
        remains in the Dev Tools area.
      </p>
    </header>

    <section class="content">
      <h2>Where to grab the data</h2>
      <p>
        Use the dedicated Dev Tool at
        <NuxtLink to="/dev/registry">/dev/registry</NuxtLink> to copy the
        combined <code>modules</code>, <code>apps</code>, and
        <code>ecosystems</code> payload. It calls the
        <code>/api/registry</code> endpoint and exposes the response as a
        formatted JSON block with a copy helper.
      </p>

      <h2>Why split docs vs. tools?</h2>
      <ul>
        <li>Developer pages stay focused on explanations and onboarding.</li>
        <li>
          Dev tools favor pragmatic JSON blocks, clipboard buttons, and raw
          data.
        </li>
        <li>Linking the two keeps context close without mixing formats.</li>
      </ul>

      <h2>Workflow reminder</h2>
      <ol>
        <li>
          Sync each package&apos;s <code>registry.json</code> via
          <code>pnpm registry:register</code>.
        </li>
        <li>Visit <code>/dev/registry</code> and copy the payload.</li>
        <li>Use that JSON for seed scripts, consoles, or parity checks.</li>
      </ol>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'FireUX Registry Docs',
  description:
    'Documentation for accessing and copying registry payloads across apps, modules, and ecosystems.',
})

definePageMeta({
  nav: {
    key: 'developer-registry-docs',
    label: 'Registry Docs',
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
  padding: 3rem 1.5rem 4rem;
  display: grid;
  gap: 2rem;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}
header h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 0.5rem;
}
header p {
  max-width: 60ch;
}
.content {
  display: grid;
  gap: 1.5rem;
  font-size: 1rem;
  line-height: 1.7;
}
.content ul,
.content ol {
  margin-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
}
.content code {
  background: rgba(148, 163, 184, 0.15);
  padding: 0.1em 0.3em;
  border-radius: var(--ui-radius);
  font-size: 0.95em;
}
</style>
