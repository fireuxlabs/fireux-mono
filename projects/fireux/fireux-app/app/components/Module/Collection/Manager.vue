<!-- Concurrent edit — 2026-07-21 16:17 CEST — Module family design: replace entity-card grammar with composition and capability rows. -->
<template>
  <div class="grid gap-12">
    <section
      aria-labelledby="module-composition-title"
      class="grid gap-6 border-y border-default py-7 lg:grid-cols-[1fr_auto_1fr_auto_1.5fr] lg:items-center"
    >
      <div class="grid gap-1">
        <p class="m-0 text-xs font-semibold uppercase tracking-wider text-primary">
          Module
        </p>
        <h2 id="module-composition-title" class="m-0 text-lg font-semibold text-highlighted">
          Reusable capability
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          A source-controlled package with a clear job.
        </p>
      </div>

      <UIcon
        name="i-lucide-arrow-right"
        class="size-5 rotate-90 text-dimmed lg:rotate-0"
      />

      <div class="grid gap-1">
        <p class="m-0 text-xs font-semibold uppercase tracking-wider text-primary">
          App
        </p>
        <h2 class="m-0 text-lg font-semibold text-highlighted">
          Added to an app
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          An app chooses the modules it needs.
        </p>
      </div>

      <UIcon
        name="i-lucide-arrow-right"
        class="size-5 rotate-90 text-dimmed lg:rotate-0"
      />

      <div class="grid gap-3">
        <p class="m-0 text-xs font-semibold uppercase tracking-wider text-primary">
          What it can support
        </p>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="surface in supportedSurfaces"
            :key="surface"
            color="neutral"
            variant="soft"
          >
            {{ surface }}
          </UBadge>
        </div>
      </div>
    </section>

    <section class="grid gap-6" aria-labelledby="extension-modules-title">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="grid gap-1">
          <h2
            id="extension-modules-title"
            class="m-0 text-2xl font-semibold text-highlighted"
          >
            Capability library
          </h2>
          <p class="m-0 text-sm leading-6 text-muted">
            {{ fireuxExtensionModules.length }} reusable FireUX modules.
          </p>
        </div>
        <UButton
          to="/modules/learn-more"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
        >
          How modules work
        </UButton>
      </div>

      <div class="divide-y divide-default border-y border-default">
        <section
          v-for="group in fireuxExtensionModuleGroups"
          :key="group.id"
          class="grid gap-5 py-7 lg:grid-cols-[14rem_1fr] lg:gap-10"
        >
          <header class="grid content-start gap-2">
            <h3 class="m-0 text-lg font-semibold text-highlighted">
              {{ group.name }}
            </h3>
            <p class="m-0 text-sm leading-6 text-muted">
              {{ group.description }}
            </p>
            <p class="m-0 text-xs font-semibold text-dimmed">
              {{ modulesFor(group.id).length }} modules
            </p>
          </header>

          <div class="divide-y divide-default">
            <article
              v-for="module in modulesFor(group.id)"
              :key="module.id"
              class="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start sm:gap-6"
            >
              <div class="flex min-w-0 items-start gap-3">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
                  <UIcon :name="module.icon" class="size-4.5 text-primary" />
                </div>
                <div class="min-w-0">
                  <h4 class="m-0 font-semibold text-highlighted">
                    {{ module.name }}
                  </h4>
                  <code class="text-xs text-dimmed">{{ module.id }}</code>
                </div>
              </div>
              <p class="m-0 text-sm leading-6 text-muted">
                {{ module.description }}
              </p>
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  fireuxExtensionModuleGroups,
  fireuxExtensionModules,
  type FireuxExtensionModuleGroupId,
} from '../../../module-catalogue'

const supportedSurfaces = ['Entities', 'Operations', 'Tools', 'Solutions'] as const

const modulesFor = (groupId: FireuxExtensionModuleGroupId) =>
  fireuxExtensionModules.filter((module) => module.group === groupId)
</script>
