<template>
  <main class="min-h-screen bg-default">
    <UContainer>
      <div class="mx-auto grid max-w-4xl gap-10">
        <header class="grid max-w-3xl gap-3">
          <NuxtLink to="/" class="w-fit hover:underline"> Misebox </NuxtLink>
          <h1 class="m-0 fx-type-page-title">Restaurant tools</h1>
          <p class="m-0 fx-type-body">
            Open free restaurant tools without signing in. Start one Kitchen
            when a tool needs Kitchen context, or use a standalone calculator
            directly.
          </p>
        </header>

        <ul class="m-0 grid gap-4 p-0">
          <li v-for="tool in tools" :key="tool.to" class="list-none">
            <NuxtLink
              :to="tool.to"
              class="group flex items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-elevated"
            >
              <span>
                <span class="block">
                  {{ tool.name }}
                </span>
                <span class="mt-1 block">
                  {{ tool.description }}
                </span>
              </span>
              <span class="flex shrink-0 items-center gap-1">
                Open
                <UIcon name="i-lucide-arrow-right" />
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const tools = [
  {
    name: 'Kitchen tools',
    description:
      'Start one Kitchen and use its available preparation, Menu and service tools without signing in.',
    to: '/tools/kitchen',
  },
  {
    name: 'Restaurant labour cost calculator',
    description:
      'Calculate total labour cost and labour percentage from restaurant sales and staffing costs.',
    to: '/tools/restaurant-labour-cost',
  },
  {
    name: 'Restaurant ordering',
    description:
      'Use the Misebox ordering tool with an available restaurant Menu.',
    to: '/tools/ordering',
  },
] as const

useSeo({
  title: 'Restaurant Tools · Misebox',
  description:
    'Use free Misebox restaurant tools without signing in, including Kitchen tools, a labour cost calculator and online ordering.',
  path: '/tools',
  jsonLdBuilder: ({ canonicalUrl, description, title, absoluteUrl }) => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: canonicalUrl,
    name: title,
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        description: tool.description,
        url: absoluteUrl(tool.to),
      })),
    },
  }),
})

definePageMeta({ layout: 'landing', name: 'MiseboxToolsIndexPage' })
</script>
