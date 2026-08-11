<template>
  <main class="template-catalogue">
    <UContainer>
      <header class="template-catalogue__header">
        <p>FireUX templates</p>
        <h1>Landing compositions with a stable spine.</h1>
        <p>
          Reusable page anatomy, live identity injection and source-backed
          examples. Templates change presentation without turning an App into a
          copy of another brand.
        </p>
      </header>

      <section aria-labelledby="landing-templates-title">
        <div class="template-catalogue__section-heading">
          <div>
            <p>Catalogue · 01</p>
            <h2 id="landing-templates-title">Landing templates</h2>
          </div>
          <span>{{ landingTemplates.length }} composition</span>
        </div>

        <NuxtLink
          v-for="template in landingTemplates"
          :key="template.slug"
          class="template-card"
          :to="`http://localhost:3001/templates/${template.slug}`"
          external
        >
          <div class="template-card__preview" aria-hidden="true">
            <span>FR</span><i /><i /><i /><span>TES</span>
          </div>
          <div class="template-card__body">
            <div>
              <span>{{ template.status }}</span>
              <span>Hospitality</span>
            </div>
            <h3>{{ template.name }}</h3>
            <p>{{ template.summary }}</p>
            <ol aria-label="Template anatomy">
              <li v-for="part in template.anatomy" :key="part">{{ part }}</li>
            </ol>
          </div>
          <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </NuxtLink>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { landingTemplates } from 'fireux-misebox/runtime/template-one-fixtures'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({ layout: 'landing', name: 'FireuxTemplatesIndexPage' })

useSeo({
  title: 'Landing Templates · FireUX',
  description:
    'Explore reusable FireUX landing compositions with live brand injection and a shared scene anatomy.',
  path: '/templates',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: landingTemplates.map((template) => ({
        name: template.name,
        url: `http://localhost:3001/templates/${template.slug}`,
      })),
    }),
})
</script>

<style scoped>
.template-catalogue {
  min-height: 100svh;
  padding: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 36)) 0;
  background: var(--ui-bg);
}
.template-catalogue :deep(.container) {
  display: grid;
  gap: clamp(calc(var(--spacing) * 16), 8vw, calc(var(--spacing) * 28));
}
.template-catalogue__header {
  display: grid;
  max-width: 62rem;
  gap: calc(var(--spacing) * 5);
}
.template-catalogue__header > p:first-child,
.template-catalogue__section-heading p {
  color: var(--ui-primary);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h1 {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(var(--text-5xl), 8vw, var(--text-9xl));
  font-weight: 750;
  letter-spacing: -0.07em;
  line-height: 0.9;
}
.template-catalogue__header > p:last-child {
  max-width: 44rem;
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 2vw, var(--text-xl));
  line-height: 1.65;
}
section {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.template-catalogue__section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding-bottom: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
}
h2 {
  margin: 0.4rem 0 0;
  font-size: clamp(1.7rem, 3vw, 2.5rem);
}
.template-catalogue__section-heading > span {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
}
.template-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(0, 1fr);
  gap: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 16));
  padding: clamp(calc(var(--spacing) * 4), 2vw, calc(var(--spacing) * 6));
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
}
.template-card__preview {
  display: flex;
  min-height: 22rem;
  align-items: center;
  justify-content: center;
  color: #f3e9d2;
  font:
    800 clamp(2.5rem, 6vw, 6rem) / 1 Impact,
    sans-serif;
  letter-spacing: -0.06em;
  background: #0b0b0a;
  border-radius: calc(var(--ui-radius) * 1.5);
  overflow: hidden;
}
.template-card__preview i {
  width: clamp(0.7rem, 1.4vw, 1.25rem);
  height: clamp(4rem, 10vw, 8rem);
  margin: 0 0.22rem;
  background: #d99a22;
  border-radius: var(--ui-radius);
  transform: rotate(3deg);
}
.template-card__body {
  display: grid;
  gap: calc(var(--spacing) * 4);
  align-content: center;
  padding: calc(var(--spacing) * 4);
}
.template-card__body > div {
  display: flex;
  gap: calc(var(--spacing) * 2);
}
.template-card__body > div span {
  padding: 0.35rem 0.6rem;
  color: var(--ui-text-muted);
  font-size: 0.68rem;
  font-weight: var(--font-weight-bold);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
}
h3 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  letter-spacing: var(--tracking-tighter);
}
.template-card__body > p {
  max-width: 38rem;
  color: var(--ui-text-muted);
  line-height: 1.65;
}
.template-card ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0;
  list-style: none;
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
}
.template-card li:not(:last-child)::after {
  margin-left: 0.35rem;
  content: '→';
}
.template-card > :deep(svg) {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 1.4rem;
  height: 1.4rem;
}
@media (max-width: 44rem) {
  .template-card {
    grid-template-columns: 1fr;
  }
  .template-card__preview {
    min-height: 17rem;
  }
}
</style>
