<template>
  <main class="min-h-screen bg-default text-default" :dir="info.direction" :lang="info.language">
    <UContainer class="py-8">
      <div class="mx-auto max-w-3xl space-y-8">
        <header class="space-y-5">
          <NuxtLink to="/info/index" class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Icon name="i-lucide-arrow-left" class="size-4" />
            Info
          </NuxtLink>

          <div class="space-y-3">
            <p class="text-sm font-semibold uppercase text-muted">
              {{ info.place.name }}
            </p>
            <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
              {{ info.page.title }}
            </h1>
            <p class="text-base leading-7 text-muted sm:text-lg">
              {{ info.page.description }}
            </p>
          </div>

          <nav class="grid gap-2 sm:grid-cols-2" aria-label="Language">
            <NuxtLink
              v-for="language in languages"
              :key="language.code"
              :to="languagePath(language.code)"
              class="rounded-md border border-default p-3 text-sm hover:bg-elevated"
              :class="{ 'border-primary/30 bg-primary/10': language.code === info.language }"
            >
              <span class="block font-semibold">{{ language.label }}</span>
              <small class="text-xs uppercase text-muted">{{ language.source }}</small>
            </NuxtLink>
          </nav>
        </header>

        <section class="space-y-4" aria-label="Page sections">
          <UCard v-for="section in info.page.sections" :key="section.id">
            <template #header>
              <div>
                <h2 class="text-xl font-semibold">{{ section.title }}</h2>
                <p class="mt-1 text-sm leading-6 text-muted">{{ section.description }}</p>
              </div>
            </template>

            <div class="grid gap-3">
              <div
                v-for="block in section.blocks"
                :key="block.id"
                class="grid grid-cols-[auto_1fr] gap-3 rounded-md border border-default p-3"
                :class="blockClass(block.type)"
              >
                <Icon :name="blockIcon(block.type)" class="mt-0.5 size-5 text-primary" />
                <div>
                  <h3 v-if="block.title" class="font-semibold">{{ block.title }}</h3>
                  <p class="leading-6 text-muted">{{ block.body }}</p>
                </div>
              </div>
            </div>
          </UCard>
        </section>

        <footer class="border-t border-default pt-6 text-sm text-muted">
          <p>Translation source: {{ sourceLabel }}</p>
        </footer>
      </div>
    </UContainer>
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

function blockClass(type: InfoBlockType) {
  if (type === 'warning') return 'bg-warning/10 border-warning/20'
  return 'bg-default'
}

useSeoMeta({
  title: computed(() => `${resolvedInfo.value.page.title} · ${resolvedInfo.value.place.name}`),
  description: computed(() => resolvedInfo.value.page.description),
})
</script>
