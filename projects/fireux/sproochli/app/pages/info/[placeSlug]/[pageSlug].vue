<template>
  <main class="info-page" :dir="info.direction" :lang="info.language">
    <header class="info-header">
      <NuxtLink class="info-brand" to="/">
        <Icon name="i-lucide-languages" />
        <span>Sproochli</span>
      </NuxtLink>

      <p class="info-place">{{ info.place.name }}</p>
      <h1>{{ info.page.title }}</h1>
      <p class="info-description">{{ info.page.description }}</p>

      <nav class="language-switcher" aria-label="Language">
        <NuxtLink
          v-for="language in languages"
          :key="language.code"
          :to="languagePath(language.code)"
          class="language-link"
          :class="{ 'language-link--active': language.code === info.language }"
        >
          <span>{{ language.label }}</span>
          <small>{{ language.source }}</small>
        </NuxtLink>
      </nav>
    </header>

    <section class="info-sections" aria-label="Page sections">
      <article v-for="section in info.page.sections" :key="section.id" class="info-section">
        <div class="info-section__header">
          <h2>{{ section.title }}</h2>
          <p>{{ section.description }}</p>
        </div>

        <div class="info-blocks">
          <div
            v-for="block in section.blocks"
            :key="block.id"
            class="info-block"
            :class="`info-block--${block.type}`"
          >
            <Icon :name="blockIcon(block.type)" />
            <div>
              <h3 v-if="block.title">{{ block.title }}</h3>
              <p>{{ block.body }}</p>
            </div>
          </div>
        </div>
      </article>
    </section>

    <footer class="info-footer">
      <p>Translation source: {{ sourceLabel }}</p>
      <a :href="apiPath">Public JSON</a>
    </footer>
  </main>
</template>

<script setup lang="ts">
import {
  resolveSproochliInfoPage,
  sproochliLanguages,
  type SproochliLanguage,
} from '../../../content/sampleInfo'
import type { InfoBlockType } from 'fireux-sproochli/runtime/info'

const route = useRoute()
const placeSlug = computed(() => String(route.params.placeSlug || ''))
const pageSlug = computed(() => String(route.params.pageSlug || ''))
const requestedLanguage = computed(() => String(route.query.lang || 'en'))

const info = computed(() =>
  resolveSproochliInfoPage(placeSlug.value, pageSlug.value, requestedLanguage.value)
)

if (!info.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Info page not found',
  })
}

const resolvedInfo = computed(() => info.value!)
const languages = sproochliLanguages

const sourceLabel = computed(() => {
  if (resolvedInfo.value.translation_source === 'original') return 'Original owner-written content'
  if (resolvedInfo.value.translation_source === 'certified') return 'Certified owner-approved translation'
  return 'Cached generated translation'
})

const apiPath = computed(
  () => `/api/public/info/${placeSlug.value}/${pageSlug.value}?lang=${resolvedInfo.value.language}`
)

function languagePath(language: SproochliLanguage) {
  return `/info/${placeSlug.value}/${pageSlug.value}?lang=${language}`
}

function blockIcon(type: InfoBlockType) {
  switch (type) {
    case 'warning':
      return 'i-lucide-triangle-alert'
    case 'contact':
      return 'i-lucide-phone'
    case 'link':
      return 'i-lucide-link'
    case 'list':
      return 'i-lucide-list-checks'
    default:
      return 'i-lucide-info'
  }
}

useSeoMeta({
  title: computed(() => `${resolvedInfo.value.page.title} · ${resolvedInfo.value.place.name}`),
  description: computed(() => resolvedInfo.value.page.description),
})
</script>

<style scoped>
.info-page {
  min-height: 100vh;
  padding: 1rem;
  background: #f7faf7;
  color: #17201b;
}

.info-header,
.info-sections,
.info-footer {
  width: min(760px, 100%);
  margin: 0 auto;
}

.info-header {
  padding: 1rem 0 1.5rem;
}

.info-brand {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  color: #12715a;
  font-weight: 800;
  text-decoration: none;
}

.info-place {
  margin: 2rem 0 0.25rem;
  color: #526158;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(2.1rem, 12vw, 4rem);
  line-height: 0.98;
  letter-spacing: 0;
}

.info-description {
  margin: 1rem 0 0;
  color: #445148;
  font-size: 1.08rem;
  line-height: 1.6;
}

.language-switcher {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.language-link {
  display: grid;
  gap: 0.1rem;
  min-height: 3.8rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #d8e3dc;
  border-radius: 8px;
  background: #ffffff;
  color: #17201b;
  text-decoration: none;
}

.language-link span {
  font-weight: 800;
}

.language-link small {
  color: #66736a;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.language-link--active {
  border-color: #12715a;
  background: #e8f6ef;
}

.info-sections {
  display: grid;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.info-section {
  padding: 1rem;
  border: 1px solid #d8e3dc;
  border-radius: 8px;
  background: #ffffff;
}

.info-section__header h2 {
  margin: 0;
  font-size: 1.45rem;
  letter-spacing: 0;
}

.info-section__header p {
  margin: 0.4rem 0 0;
  color: #526158;
  line-height: 1.6;
}

.info-blocks {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.info-block {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 8px;
  background: #f3f7f4;
}

.info-block--warning {
  background: #fff7ed;
}

.info-block--contact {
  background: #edf7ff;
}

.info-block :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
  margin-top: 0.15rem;
  color: #12715a;
}

.info-block--warning :deep(svg) {
  color: #b45309;
}

.info-block h3,
.info-block p {
  margin: 0;
}

.info-block h3 {
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.info-block p {
  line-height: 1.6;
}

.info-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  padding: 1rem 0 2rem;
  color: #5c6a61;
  font-size: 0.9rem;
}

.info-footer p {
  margin: 0;
}

.info-footer a {
  color: #12715a;
  font-weight: 800;
}

[dir='rtl'] .info-block {
  grid-template-columns: 1fr auto;
}

[dir='rtl'] .info-block :deep(svg) {
  grid-column: 2;
  grid-row: 1;
}

[dir='rtl'] .info-block div {
  grid-column: 1;
  grid-row: 1;
}

@media (min-width: 620px) {
  .info-page {
    padding: 1.5rem;
  }

  .language-switcher {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
