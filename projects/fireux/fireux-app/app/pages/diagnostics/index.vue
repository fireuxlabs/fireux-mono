<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Tools"
      description="Clipboard-first utilities for directory projections, diagnostics, and FireUX automation."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2 class="fx-type-section-title">Directory + diagnostics</h2>
            <p class="fx-type-caption">
              These tools skip narration and expose allowlisted projections for
              parity checks and incident response.
            </p>
          </div>
        </template>

        <div class="space-y-2">
          <p>
            Use this stack when you need projected JSON without opening a
            workspace. Entity authority stays behind the projection boundary.
          </p>
          <p>
            Need onboarding context instead of payloads? Hop to
            <NuxtLink class="hover:underline" to="/developer/registry">
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
          :to="`/diagnostics/${tool.slug}`"
          class="group block"
        >
          <UCard class="transition">
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
                  aria-hidden="true"
                >
                  <Icon :name="tool.icon" />
                </span>
                <div>
                  <p class="fx-type-body">
                    {{ tool.label }}
                  </p>
                  <p class="fx-type-caption">
                    {{ tool.description }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
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
  layout: 'diagnostics',
  title: 'Diagnostics · Tools',
  nav: {
    key: 'dev-fireux-tools',
    label: 'FireUX Tools',
    icon: 'i-lucide-terminal',
    desktop: true,
    group: 'core',
    order: 95,
    layouts: ['diagnostics'],
  },
})

useSeoMeta({
  title: 'FireUX Diagnostics',
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
