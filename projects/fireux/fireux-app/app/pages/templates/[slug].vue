<template>
  <main v-if="template" class="template-detail">
    <UContainer class="template-detail__intro">
      <NuxtLink to="/templates" class="template-detail__back">
        <UIcon name="i-lucide-arrow-left" aria-hidden="true" /> Templates
      </NuxtLink>
      <div class="template-detail__title">
        <div>
          <p>Landing template · {{ template.status }}</p>
          <h1>{{ template.name }}</h1>
        </div>
        <p>{{ template.summary }}</p>
      </div>
      <TemplateBrandSwitcher
        :model-value="selectedBrandId"
        :brands="template.brands"
      />
    </UContainer>

    <section class="template-detail__stage" aria-label="Live template preview">
      <div class="template-detail__toolbar">
        <div aria-label="Preview viewport">
          <NuxtLink
            v-for="option in viewportOptions"
            :key="option.id"
            replace
            :to="{ query: { ...route.query, viewport: option.id } }"
            :aria-pressed="viewport === option.id"
            :aria-label="`${option.label} preview`"
          >
            <UIcon :name="option.icon" aria-hidden="true" />
          </NuxtLink>
        </div>
        <p>{{ activeBrand.name }} · live injection</p>
      </div>
      <div class="template-detail__viewport" :data-viewport="viewport">
        <TemplateSceneOnePreview :brand="activeBrand" />
      </div>
    </section>

    <UContainer class="template-detail__facts">
      <section>
        <p class="template-detail__kicker">Anatomy</p>
        <h2>One implementation, four levels.</h2>
        <ol>
          <li v-for="(part, index) in template.anatomy" :key="part">
            <span>0{{ index + 1 }}</span
            ><strong>{{ part }}</strong>
          </li>
        </ol>
      </section>
      <section>
        <p class="template-detail__kicker">Injection boundary</p>
        <h2>Identity changes. Structure does not.</h2>
        <ul>
          <li v-for="feature in template.features" :key="feature">
            {{ feature }}
          </li>
        </ul>
        <div class="template-detail__asset-note">
          <strong>{{ activeBrand.name }} assets</strong>
          <p>{{ activeBrand.assetNote }}</p>
          <p v-if="activeBrand.heroMedia">
            Media: {{ activeBrand.heroMedia.source }}
          </p>
          <p v-if="activeBrand.wordmark">
            Wordmark: {{ activeBrand.wordmark.source }}
          </p>
        </div>
      </section>
    </UContainer>

    <UContainer class="template-detail__purchase">
      <div>
        <p class="template-detail__kicker">Purchase</p>
        <h2>Use this theme for your App.</h2>
        <p>
          Choose the seller that fits your project. The template anatomy stays
          the same; setup applies your approved identity, content and media.
        </p>
      </div>
      <div>
        <UButton
          v-for="option in template.purchaseOptions"
          :key="option.seller"
          :to="option.to"
          :target="option.to.startsWith('http') ? '_blank' : undefined"
          :color="option.seller === 'FireUX' ? 'primary' : 'neutral'"
          :variant="option.seller === 'FireUX' ? 'solid' : 'outline'"
          trailing-icon="i-lucide-arrow-up-right"
        >
          {{ option.label }}
        </UButton>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { createError } from 'h3'
import {
  findLandingTemplate,
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
} from '../../content/landing-templates'
import type { LandingTemplateBrandId } from '../../types/landing-template'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const route = useRoute()
const template = findLandingTemplate(String(route.params.slug || ''))
if (!template)
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })

const selectedBrandId = computed<LandingTemplateBrandId>(() =>
  isLandingTemplateBrandId(String(route.query.brand || ''))
    ? (route.query.brand as LandingTemplateBrandId)
    : 'friiites'
)
const viewport = computed<'desktop' | 'phone'>(() =>
  route.query.viewport === 'phone' ? 'phone' : 'desktop'
)
const viewportOptions = [
  { id: 'desktop', label: 'Desktop', icon: 'i-lucide-monitor' },
  { id: 'phone', label: 'Phone', icon: 'i-lucide-smartphone' },
] as const

const activeBrand = computed(
  () => findLandingTemplateBrand(selectedBrandId.value) || template.brands[0]
)

definePageMeta({ layout: 'landing', name: 'FireuxTemplateDetailPage' })
useSeo({
  title: `${template.name} Landing Template · FireUX`,
  description: template.summary,
  path: `/templates/${template.slug}`,
  image: '/img/app/cover.png',
})
</script>

<style scoped>
.template-detail {
  min-height: 100svh;
  padding: calc(var(--spacing) * 24) 0 calc(var(--spacing) * 32);
  background: var(--ui-bg);
}
.template-detail__intro {
  display: grid;
  gap: calc(var(--spacing) * 10);
  padding-bottom: calc(var(--spacing) * 8);
}
.template-detail__back {
  display: inline-flex;
  width: fit-content;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  font-weight: var(--font-weight-bold);
}
.template-detail__title {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.7fr);
  gap: calc(var(--spacing) * 8);
  align-items: end;
}
.template-detail__title > div > p,
.template-detail__kicker {
  color: var(--ui-primary);
  font-size: 0.7rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h1 {
  margin: 0.4rem 0 0;
  font-size: clamp(var(--text-6xl), 9vw, var(--text-9xl));
  letter-spacing: -0.08em;
  line-height: 0.85;
}
.template-detail__title > p {
  max-width: 36rem;
  color: var(--ui-text-muted);
  font-size: 1.05rem;
  line-height: 1.65;
}
.template-detail__stage {
  width: min(100% - 2rem, 100rem);
  margin: calc(var(--spacing) * 4) auto calc(var(--spacing) * 24);
  padding: 0.6rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
}
.template-detail__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 3.5rem;
  padding: 0 calc(var(--spacing) * 3);
}
.template-detail__toolbar > div {
  display: flex;
  gap: 0.35rem;
}
.template-detail__toolbar a {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--ui-text-muted);
  background: transparent;
  border: 0;
  border-radius: var(--ui-radius);
  cursor: pointer;
  place-items: center;
}
.template-detail__toolbar a[aria-pressed='true'] {
  color: var(--ui-text-highlighted);
  background: var(--ui-bg-accented);
}
.template-detail__toolbar p {
  color: var(--ui-text-muted);
  font-size: 0.72rem;
}
.template-detail__viewport {
  width: 100%;
  margin-inline: auto;
  background: #222;
  border-radius: calc(var(--ui-radius) * 1.5);
  overflow: auto;
  transition: width 180ms ease;
}
.template-detail__viewport[data-viewport='phone'] {
  width: min(100%, 25rem);
  max-height: 50rem;
}
.template-detail__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 32));
}
.template-detail__facts section {
  display: grid;
  gap: calc(var(--spacing) * 5);
  align-content: start;
}
.template-detail__facts h2 {
  max-width: 13ch;
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
}
.template-detail__facts ol,
.template-detail__facts ul {
  display: grid;
  gap: 0;
  margin: calc(var(--spacing) * 4) 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--ui-border);
}
.template-detail__facts li {
  display: flex;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4) 0;
  border-bottom: 1px solid var(--ui-border);
}
.template-detail__facts li span {
  color: var(--ui-text-muted);
  font-size: 0.7rem;
}
.template-detail__asset-note {
  display: grid;
  gap: 0.45rem;
  margin-top: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5);
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  line-height: 1.55;
  background: var(--ui-bg-muted);
  border-radius: calc(var(--ui-radius) * 1.5);
}
.template-detail__asset-note strong {
  color: var(--ui-text-highlighted);
}
.template-detail__purchase {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: calc(var(--spacing) * 8);
  align-items: end;
  margin-top: calc(var(--spacing) * 24);
  padding-block: calc(var(--spacing) * 10);
  border-top: 1px solid var(--ui-border);
}
.template-detail__purchase h2 {
  margin: 0.45rem 0 calc(var(--spacing) * 4);
  font-size: clamp(2rem, 4vw, 3.5rem);
  letter-spacing: var(--tracking-tighter);
}
.template-detail__purchase > div:first-child > p:last-child {
  max-width: 42rem;
  color: var(--ui-text-muted);
  line-height: 1.65;
}
.template-detail__purchase > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  justify-content: end;
}
@media (max-width: 48rem) {
  .template-detail__title,
  .template-detail__facts,
  .template-detail__purchase {
    grid-template-columns: 1fr;
  }
  .template-detail__purchase > div:last-child {
    justify-content: start;
  }
  .template-detail__toolbar p {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .template-detail__viewport {
    transition: none;
  }
}
</style>
