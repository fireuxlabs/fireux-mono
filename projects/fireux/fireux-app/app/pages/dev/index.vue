<template>
  <main class="dev-tools">
    <header>
      <p class="eyebrow">Dev Utilities</p>
      <h1>Operational Data Tools</h1>
      <p>
        Internal-only utilities designed for engineers who need raw registry
        payloads, seed data, or diagnostics without digging through Firestore.
        These pages intentionally surface JSON blocks and copy helpers rather
        than narrative docs.
      </p>
    </header>

    <section class="tools-grid">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.slug"
        class="tool-card"
        :to="`/dev/${tool.slug}`"
      >
        <span class="tool-icon" :class="tool.icon" aria-hidden="true" />
        <div>
          <p class="tool-label">{{ tool.label }}</p>
          <p class="tool-description">{{ tool.description }}</p>
        </div>
        <span class="chevron" aria-hidden="true">→</span>
      </NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
interface DevToolLink {
  slug: string
  label: string
  description: string
  icon: string
}

definePageMeta({
  nav: {
    key: 'dev-home',
    label: 'Dev Tools',
    icon: 'i-lucide-terminal',
    desktop: false,
    mobile: false,
    section: 'dev-tools',
  },
})

useSeoMeta({
  title: 'FireUX Dev Tools',
  description: 'Internal utilities for JSON payload access and diagnostics.',
})

const tools: DevToolLink[] = [
  {
    slug: 'registry',
    label: 'Registry Snapshot',
    description: 'Copy the full apps/modules/ecosystems payload as JSON.',
    icon: 'i-lucide-database',
  },
]
</script>

<style scoped>
.dev-tools {
  max-width: 960px;
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
  max-width: 65ch;
}
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}
.tool-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(8, 10, 18, 0.85);
  transition: border 0.2s ease, transform 0.2s ease;
}
.tool-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
.tool-icon {
  font-size: 1.5rem;
  color: #a5b4fc;
}
.tool-label {
  font-weight: 600;
  color: #f8fafc;
}
.tool-description {
  font-size: 0.9rem;
  color: #cbd5f5;
}
.chevron {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.6);
}
</style>
