<!-- Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: add the shared factual index route. -->
<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto grid max-w-5xl gap-10">
        <header class="grid max-w-3xl gap-3">
          <NuxtLink
            to="/"
            class="w-fit text-sm font-semibold text-primary hover:underline"
          >
            {{ appName }}
          </NuxtLink>
          <h1
            class="m-0 text-3xl font-semibold leading-tight text-highlighted sm:text-4xl"
          >
            Operations
          </h1>
          <p class="m-0 text-base leading-7 text-muted">
            Operations across {{ appName }} consoles.
          </p>
          <nav
            v-if="operationGroups.length > 1"
            aria-label="Console operations"
            class="mt-2 flex flex-wrap gap-2"
          >
            <UButton
              v-for="group in operationGroups"
              :key="group.id"
              :to="`#${group.id}`"
              color="neutral"
              variant="soft"
              size="sm"
            >
              {{ group.name }}
            </UButton>
          </nav>
        </header>

        <section
          v-for="group in operationGroups"
          :id="group.id"
          :key="group.id"
          class="grid gap-5"
        >
          <div class="flex min-w-0 items-center justify-between gap-4">
            <h2 class="m-0 text-xl font-semibold text-highlighted">
              {{ group.name }}
            </h2>
            <NuxtLink
              :to="group.to"
              class="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              Open console
            </NuxtLink>
          </div>
          <PublicOperationsGrid :operations="group.operations" />
        </section>

        <UAlert
          v-if="!operations.length"
          color="neutral"
          variant="soft"
          title="No operations published yet"
          description="This app has not declared any Console Operations."
        />
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPublicPageJsonLd,
  useSeo,
} from '../../composables/fireux/seo/useSeo'
import type { FireuxMetaOperation } from '../../../config/app/meta-content'

type OperationsResponse = {
  ok: boolean
  operations: FireuxMetaOperation[]
}

const fireux = useFireUXConfig()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')
const { data } = await useAsyncData('public-app-operations', () =>
  $fetch<OperationsResponse>('/api/public/app/operations')
)
const operations = computed(() => data.value?.operations || [])
const operationGroups = computed(() => {
  const groups = new Map<
    string,
    { id: string; name: string; to: string; operations: FireuxMetaOperation[] }
  >()
  for (const operation of operations.value) {
    const existing = groups.get(operation.console.id)
    if (existing) {
      existing.operations.push(operation)
      continue
    }
    groups.set(operation.console.id, {
      ...operation.console,
      operations: [operation],
    })
  }
  return Array.from(groups.values())
})

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'operations',
    label: 'Operations',
    icon: 'i-lucide-list-checks',
    order: 27,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    visibility: {
      appRoles: ['global', 'standalone'],
    },
  },
})

const pageTitle = computed(() => `Operations - ${appName.value}`)
const pageDescription = computed(
  () => `Operations across ${appName.value} consoles.`
)

useSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/operations',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: operations.value
        .filter((operation) => operation.slug)
        .map((operation) => ({
          name: operation.title,
          url: context.absoluteUrl(`/operations/${operation.slug}`),
        })),
    }),
})
</script>
