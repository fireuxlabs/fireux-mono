<template>
  <main class="misebox-templates">
    <UContainer>
      <p class="misebox-templates__kicker">Misebox themes</p>
      <h1>Restaurant identity, applied to a proven landing template.</h1>
      <p class="misebox-templates__intro">
        Preview Template One with restaurant identities, then request setup
        through Misebox. Your approved palette, type, content and media change;
        the reusable template anatomy does not.
      </p>
      <div class="misebox-templates__actions">
        <UButton
          to="/templates/template-one"
          size="xl"
          trailing-icon="i-lucide-arrow-up-right"
        >
          Preview Template One
        </UButton>
        <UButton to="/get-started" size="xl" color="neutral" variant="outline">
          Request through Misebox
        </UButton>
      </div>
      <section>
        <p>One template family</p>
        <ul>
          <li>Shared Page → Scenes → Layers → Elements anatomy</li>
          <li>Identity-only brand injection</li>
          <li>Desktop and phone preview</li>
          <li>Approved assets only; absent media remains absent</li>
        </ul>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({ layout: 'landing', name: 'MiseboxTemplatesIndexPage' })

useSeo({
  title: 'Restaurant Themes · Misebox',
  description:
    'Preview a reusable restaurant landing theme and request branded setup through Misebox.',
  path: '/templates',
  image: '/img/app/cover.png',
})
</script>

<style scoped>
.misebox-templates {
  min-height: 100svh;
  padding: clamp(calc(var(--spacing) * 24), 12vw, calc(var(--spacing) * 40)) 0;
  background: var(--ui-bg);
}
.misebox-templates :deep(.container) {
  display: grid;
  gap: calc(var(--spacing) * 7);
}
.misebox-templates__kicker,
section > p {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
h1 {
  max-width: 15ch;
  margin: 0;
  font-size: clamp(var(--text-5xl), 8vw, var(--text-8xl));
  letter-spacing: -0.065em;
  line-height: 0.94;
}
.misebox-templates__intro {
  max-width: 48rem;
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-lg), 2vw, var(--text-xl));
  line-height: 1.65;
}
.misebox-templates__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}
section {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin-top: calc(var(--spacing) * 12);
  padding-top: calc(var(--spacing) * 8);
  border-top: 1px solid var(--ui-border);
}
ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
  margin: 0;
  padding: 0;
  list-style: none;
}
li {
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
@media (max-width: 40rem) {
  ul {
    grid-template-columns: 1fr;
  }
}
</style>
