<template>
  <UPage>
    <UContainer>
      <div class="pagebody">
        <header class="pagebody">
          <ULink to="/"> Misebox </ULink>
          <h1 class="fx-type-page-title">Restaurant tools</h1>
          <p class="fx-type-body">
            Open free restaurant tools without signing in. Start one Kitchen
            when a tool needs Kitchen context, or use a standalone calculator
            directly.
          </p>
        </header>

        <ul class="fx-list-stack">
          <li v-for="tool in tools" :key="tool.to">
            <ULink :to="tool.to">
              <span>
                <span>
                  {{ tool.name }}
                </span>
                <span>
                  {{ tool.description }}
                </span>
              </span>
              <span>
                Open
                <UIcon name="i-lucide-arrow-right" />
              </span>
            </ULink>
          </li>
        </ul>
      </div>
    </UContainer>
  </UPage>
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
