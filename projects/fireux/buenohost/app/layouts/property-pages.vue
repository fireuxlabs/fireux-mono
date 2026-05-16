<template>
  <main class="min-h-screen bg-default text-default">
    <header class="border-b border-default bg-default">
      <UContainer class="flex items-center justify-between gap-4 py-4">
        <NuxtLink to="/" class="inline-flex items-center gap-3 text-sm font-semibold text-primary">
          <img src="/img/app/logo.png" alt="" class="size-8 rounded" />
          <span>BuenoHost</span>
        </NuxtLink>

        <UButton
          :to="property ? `/properties/${property.slug}` : '/'"
          icon="i-lucide-house"
          color="neutral"
          variant="ghost"
        >
          Property
        </UButton>
      </UContainer>
    </header>

    <UContainer
      v-if="pages && property"
      class="grid min-w-0 gap-6 py-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-8"
    >
      <aside class="min-w-0 lg:pt-1">
        <nav class="lg:sticky lg:top-6" aria-label="Property pages navigation">
          <div class="flex max-w-full gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
            <NuxtLink
              :to="`/properties/${property.slug}/pages`"
              class="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-default"
              :class="{ 'bg-elevated font-semibold text-default': !currentPageId }"
            >
              Welcome
            </NuxtLink>
            <NuxtLink
              v-for="page in topics"
              :key="page.id"
              :to="`/properties/${property.slug}/pages/${page.id}`"
              class="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-default"
              :class="{ 'bg-elevated font-semibold text-default': currentPageId === page.id }"
            >
              {{ page.title }}
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <div class="min-w-0">
        <slot />
      </div>
    </UContainer>

    <UContainer v-else class="py-8">
      <slot />
    </UContainer>

    <LayoutsSharedFloatingChatButton />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPropertyPageTopics, resolvePropertyPages } from '../demo/propertyPages'
import { findDemoBuenoHostPublicProperty } from '../demo/properties'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const property = computed(() => findDemoBuenoHostPublicProperty(slug.value))
const pages = computed(() => (property.value ? resolvePropertyPages(property.value.slug) : null))
const topics = computed(() => (pages.value ? getPropertyPageTopics(pages.value) : []))
const currentPageId = computed(() => String(route.params.pageId || ''))
</script>
