<template>
  <UContainer>
    <UPage>
      <!-- Left: docs navigation -->
      <template #left>
        <UPageAside class="w-64 shrink-0">
          <UContentNavigation
            highlight
            :navigation="navigation"
            :default-open="false"
          />
        </UPageAside>
      </template>

      <!-- Main: current docs page -->
      <UPageBody class="pagebody min-w-0">
        <header
          class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800"
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
import { fetchContentNavigation } from '#imports'

defineOptions({ name: 'docs' })

const { data: navigationRaw } = await useAsyncData(
  'fireux-docs-navigation',
  () => fetchContentNavigation({ source: 'fireuxDocs' })
)

function withDocsBase(items: any[] = []) {
  return items.map((item) => {
    const path = item._path || item.path || '/'
    const prefixed = path === '/' ? '/docs' : `/docs${path}`
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
