<template>
  <div class="fx-layout-shell">
    <FireLayoutsDefaultHeader />

    <main class="fx-layout-main">
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside>
              <DocsNavigation :items="navigation" />
            </UPageAside>
          </template>

          <UPageBody class="pagebody">
            <div class="mb-6 space-y-1">
              <p class="text-sm font-medium text-primary">FireUX Docs</p>
              <p class="text-sm text-dimmed">
                Build, ship, and operate FireUX.
              </p>
            </div>

            <slot />
          </UPageBody>
        </UPage>
      </UContainer>
    </main>

    <FireLayoutsDefaultFooter />
  </div>
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
