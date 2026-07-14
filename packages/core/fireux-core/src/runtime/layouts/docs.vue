<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <DocsNavigation :items="navigation" />
        </UPageAside>
      </template>

      <UPageBody class="pagebody">
        <div class="mb-6 space-y-3">
          <LayoutsSharedBreadcrumbs />

          <div class="space-y-1">
            <p class="text-sm font-medium">FireUX Docs</p>
            <h1 class="text-2xl font-semibold">
              Build, ship, and operate FireUX
            </h1>
            <p class="text-sm text-dimmed">
              One map for apps, profiles, tenants, and the platform primitives.
            </p>
          </div>
        </div>

        <NuxtPage />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import * as nuxtImports from '#imports'
import { computed, provide } from 'vue'

defineOptions({ name: 'docs' })

const { data: navigationRaw } = await useAsyncData(
  'fireux-docs-navigation',
  async () => {
    const queryNavigation = (nuxtImports as Record<string, unknown>)
      .queryCollectionNavigation

    if (typeof queryNavigation !== 'function') return []

    return queryNavigation('fireuxDocs' as never)
  }
)

function withDocsBase(items: any[] = []): any[] {
  return items.map((item) => {
    const contentPath = item._path || item.path || '/'
    const normalizedPath =
      contentPath === '/README'
        ? '/'
        : contentPath.replace(/\/README$/, '') || '/'
    const prefixed = normalizedPath === '/' ? '/docs' : `/docs${normalizedPath}`
    return {
      ...item,
      _path: prefixed,
      path: prefixed,
      children: item.children ? withDocsBase(item.children) : undefined,
    }
  })
}

const navigation = computed(() => withDocsBase(navigationRaw.value || []))

provide('navigation', navigation)
</script>
