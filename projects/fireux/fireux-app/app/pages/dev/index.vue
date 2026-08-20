<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader class="border-b-0"
      title="Dev · Tools"
      description="Clipboard-first utilities for directory projections, diagnostics, and FireUX automation."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2
              class="text-base font-semibold text-highlighted"
            >
              Directory + diagnostics
            </h2>
            <p class="text-sm text-muted">
              These tools skip narration and expose allowlisted projections for
              parity checks and incident response.
            </p>
          </div>
        </template>

        <div class="space-y-2 text-sm text-toned">
          <p>
            Use this stack when you need projected JSON without opening a
            workspace. Entity authority stays behind the projection boundary.
          </p>
          <p>
            Need onboarding context instead of payloads? Hop to
            <NuxtLink
              class="text-primary hover:underline"
              to="/developer/registry"
            >
              Developer · Directory Docs
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
            class="h-full transition duration-200 group-hover:border-primary"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Icon :name="tool.icon" class="text-lg" />
                </span>
                <div>
                  <p
                    class="text-base font-semibold text-highlighted"
                  >
                    {{ tool.label }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ tool.description }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-2 text-sm text-muted"
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
    label: 'Directory Snapshot',
    description: 'Copy allowlisted App and Ecosystem projections as JSON.',
    icon: 'i-lucide-database',
  },
]
</script>
