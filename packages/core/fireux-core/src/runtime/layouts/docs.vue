<template>
  <UContainer class="docs-layout">
    <UPage class="docs-layout__page">
      <!-- Left: docs navigation -->
      <template #left>
        <UPageAside class="docs-layout__aside w-64 shrink-0">
          <UContentNavigation
            highlight
            :navigation="navigation"
            :default-open="false"
          />
        </UPageAside>
      </template>

      <!-- Main: current docs page -->
      <UPageBody class="pagebody docs-layout__body">
        <header
          class="docs-layout__hero flex flex-wrap items-start justify-between gap-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              to="/"
              label="FireUX Home"
              icon="i-lucide-house"
              size="sm"
              color="primary"
              variant="soft"
              class="rounded-full"
            />
            <div class="space-y-1">
              <p
                class="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300"
              >
                FireUX Docs
              </p>
              <h1 class="text-xl font-semibold">
                Build, ship, and operate FireUX
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                One map for apps, profiles, tenants, and the platform
                primitives.
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
          >
            <span
              class="rounded-full bg-primary-50 px-3 py-1 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100"
              >Framework</span
            >
            <span
              class="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >Nuxt Content</span
            >
          </div>
        </header>

        <NuxtPage />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'

defineOptions({ name: 'docs' })

const { data: navigationRaw } = await useAsyncData(
  'fireux-docs-navigation',
  () => queryCollectionNavigation('fireuxDocs' as never)
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

<style scoped>
.docs-layout {
  position: relative;
}

.docs-layout__page {
  gap: 1.5rem;
}

.docs-layout__aside {
  padding: 1rem;
  border: 1px solid rgb(228 228 231 / 0.85);
  border-radius: 1.5rem;
  background: rgb(255 255 255 / 0.82);
  box-shadow: 0 24px 54px -48px rgb(24 24 27 / 0.28);
}

.docs-layout__body {
  min-width: 0;
}

.docs-layout__hero {
  padding: 1.25rem;
  border: 1px solid rgb(228 228 231 / 0.88);
  border-radius: 1.5rem;
  background:
    linear-gradient(135deg, rgb(255 251 235 / 0.88), rgb(255 255 255 / 0.96));
  box-shadow: 0 24px 54px -48px rgb(24 24 27 / 0.28);
}
</style>
