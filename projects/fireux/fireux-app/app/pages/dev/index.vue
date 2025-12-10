<template>
  <UPage>
    <UPageHeader
      title="Dev · Tools"
      description="Clipboard-first utilities for registry data, diagnostics, and FireUX automation."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2
              class="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              Registry + diagnostics
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              These tools skip narration and expose raw payloads for seeding,
              parity checks, and incident response.
            </p>
          </div>
        </template>

        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>
            Run through this stack whenever you need Firestore-aligned JSON
            without touching the console. Everything here mirrors the nuxt dev
            layout used across FireUX core, ecosystems, and extensions.
          </p>
          <p>
            Need onboarding context instead of payloads? Hop to
            <NuxtLink
              class="text-primary-500 hover:underline"
              to="/developer/registry"
            >
              Developer · Registry Docs
            </NuxtLink>
            for human-readable workflows.
          </p>
        </div>
      </UCard>

      <section class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="tool in tools"
          :key="tool.slug"
          :to="`/dev/${tool.slug}`"
          class="group block"
        >
          <UCard
            class="h-full transition duration-200 group-hover:border-primary-500"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-200"
                  aria-hidden="true"
                >
                  <Icon :name="tool.icon" class="text-lg" />
                </span>
                <div>
                  <p
                    class="text-base font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {{ tool.label }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ tool.description }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <span>Open tool</span>
                <Icon
                  name="i-lucide-arrow-up-right"
                  class="transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
interface DevToolLink {
  slug: string
  label: string
  description: string
  icon: string
}

definePageMeta({
  layout: 'dev',
  title: 'Dev · Tools',
  nav: {
    key: 'dev-fireux-tools',
    label: 'FireUX Tools',
    icon: 'i-lucide-terminal',
    desktop: true,
    group: 'core',
    order: 95,
    layouts: ['dev'],
  },
})

useSeoMeta({
  title: 'FireUX Dev Tools',
  description: 'Internal utilities for JSON payload access and diagnostics.',
})

const tools: DevToolLink[] = [
  {
    slug: 'registry',
    label: 'Registry Snapshot',
    description: 'Copy all apps, modules, and ecosystems as JSON.',
    icon: 'i-lucide-database',
  },
]
</script>
