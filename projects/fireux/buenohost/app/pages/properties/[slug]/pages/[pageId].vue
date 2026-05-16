<template>
  <div v-if="resolvedPages && resolvedPage" class="min-w-0 space-y-8">
    <section class="space-y-5">
      <NuxtLink
        :to="propertyPagesPath"
        class="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <Icon name="i-lucide-arrow-left" class="size-4" />
        {{ resolvedPages.title }}
      </NuxtLink>

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary" variant="soft">
            Property pages
          </UBadge>
          <UBadge color="neutral" variant="outline">
            {{ resolvedPages.property.name }}
          </UBadge>
        </div>

        <div class="grid gap-4 sm:flex sm:items-start">
          <div class="rounded-md bg-primary/10 p-3 text-primary">
            <Icon :name="resolvedPage.icon" class="size-7" />
          </div>
          <div>
            <p class="text-sm font-semibold uppercase text-muted">
              {{ resolvedPages.title }}
            </p>
            <h1 class="mt-2 text-3xl font-semibold tracking-normal text-highlighted sm:text-5xl">
              {{ resolvedPage.title }}
            </h1>
            <p class="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              {{ resolvedPage.summary }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4" aria-labelledby="page-content-title">
      <h2 id="page-content-title" class="sr-only">
        {{ resolvedPage.title }} details
      </h2>

      <UCard>
        <ul class="grid gap-2">
          <li
            v-for="item in resolvedPage.items"
            :key="item.label || item.value"
            class="rounded-md border border-default px-3 py-2 text-sm"
            :class="itemClass(item.tone)"
          >
            <span v-if="item.label" class="block text-xs font-semibold uppercase opacity-70">
              {{ item.label }}
            </span>
            <span>{{ item.value }}</span>
          </li>
        </ul>
      </UCard>

      <div class="grid gap-3 sm:flex sm:flex-wrap">
        <UButton
          v-if="previousPage"
          :to="topicPath(previousPage.id)"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="soft"
          block
          class="sm:w-auto"
        >
          {{ previousPage.title }}
        </UButton>
        <UButton
          v-if="nextPage"
          :to="topicPath(nextPage.id)"
          trailing-icon="i-lucide-arrow-right"
          color="primary"
          variant="soft"
          block
          class="sm:w-auto"
        >
          {{ nextPage.title }}
        </UButton>
      </div>
    </section>
  </div>
  <UCard v-else>
    <div class="space-y-3">
      <UBadge color="warning" variant="soft">
        Error 404
      </UBadge>
      <h1 class="text-3xl font-semibold text-highlighted">
        Property page not found
      </h1>
      <p class="text-muted">
        This page is not enabled for this property.
      </p>
      <UButton to="/" color="primary" variant="soft">
        Back to BuenoHost
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus } from '#imports'
import {
  getPropertyPageTopics,
  resolvePropertyPages,
  resolvePropertyPage,
  type PropertyPageItem,
} from '../../../../demo/propertyPages'
import { findDemoBuenoHostPublicProperty } from '../../../../demo/properties'

definePageMeta({
  layout: 'property-pages',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const pageId = computed(() => String(route.params.pageId || ''))
const property = computed(() => findDemoBuenoHostPublicProperty(slug.value))
const pages = computed(() => property.value ? resolvePropertyPages(property.value.slug) : null)
const page = computed(() =>
  property.value ? resolvePropertyPage(property.value.slug, pageId.value) : null
)

const resolvedProperty = computed(() => property.value)
const resolvedPages = computed(() => pages.value)
const resolvedPage = computed(() => page.value)

if (!resolvedPages.value || !resolvedPage.value) {
  setResponseStatus(404)
}

const pageTopics = computed(() =>
  resolvedPages.value ? getPropertyPageTopics(resolvedPages.value) : []
)
const currentIndex = computed(() =>
  pageTopics.value.findIndex((topic) => topic.id === resolvedPage.value?.id)
)
const previousPage = computed(() =>
  currentIndex.value > 0 ? pageTopics.value[currentIndex.value - 1] : null
)
const nextPage = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < pageTopics.value.length - 1
    ? pageTopics.value[currentIndex.value + 1]
    : null
)
const propertyPagesPath = computed(() =>
  resolvedProperty.value ? `/properties/${resolvedProperty.value.slug}/pages` : '/'
)

function topicPath(targetPageId: string) {
  if (!resolvedProperty.value) return ''
  return `/properties/${resolvedProperty.value.slug}/pages/${targetPageId}`
}

function itemClass(tone: PropertyPageItem['tone']) {
  if (tone === 'important') return 'border-primary/20 bg-primary/10 text-default'
  if (tone === 'warning') return 'border-warning/20 bg-warning/10 text-default'
  return 'bg-default text-default'
}

useSeoMeta({
  title: computed(() =>
    resolvedPages.value && resolvedPage.value
      ? `${resolvedPage.value.title} · ${resolvedPages.value.title}`
      : 'Property page not found'
  ),
  description: computed(() => resolvedPage.value?.summary || 'Property page not found'),
})
</script>
