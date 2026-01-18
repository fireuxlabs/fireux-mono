<template>
  <main class="space-y-10 py-10">
    <header class="space-y-4 text-center md:text-left">
      <p class="text-xs uppercase tracking-[0.25em] text-primary/70">
        FireUX Platform
      </p>
      <div class="space-y-2">
        <h1 class="text-3xl font-semibold text-primary-foreground">
          Modules Registry
        </h1>
        <p class="text-base text-muted-foreground">
          Every module that ships with the FireUX ecosystem. Apps opt-in per
          tenant so Cleanbox, Misebox, and Richie can select what they need.
        </p>
      </div>
    </header>

    <section class="space-y-4">
      <div
        class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 class="text-xl font-medium text-primary-foreground">
            Modules &amp; teams
          </h2>
          <p class="text-sm text-muted-foreground">
            Quick directory showing who owns each module. Registry entries will
            expand this list automatically once synced.
          </p>
        </div>
        <NuxtLink class="link" to="/create-and-register">
          View creation workflow →
        </NuxtLink>
      </div>

      <div class="overflow-hidden rounded-xl border border-border/70">
        <table v-if="modules.length" class="w-full text-left text-sm">
          <thead class="bg-muted/60 text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">Module</th>
              <th class="px-4 py-3 font-medium">Team</th>
            </tr>
          </thead>
          <tbody class="bg-card">
            <tr
              v-for="module in modules"
              :key="module.name"
              class="border-t border-border/60"
            >
              <td class="px-4 py-3 text-primary-foreground">
                {{ module.name }}
              </td>
              <td class="px-4 py-3 text-muted-foreground">
                {{ module.team }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="space-y-3 p-6 text-sm text-muted-foreground">
          <p class="font-medium text-primary-foreground">No modules yet</p>
          <p>
            This directory will populate automatically once
            <code>registry.json</code> files sync through the
            <code>pnpm registry:register</code> flow.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { FireuxModuleRegistryDoc } from 'fireux-core/runtime/models/system/module.model'
import { useState } from 'nuxt/app'

definePageMeta({
  nav: {
    key: 'modules',
    label: 'Modules',
    icon: 'i-lucide-puzzle',
    desktop: true,
    mobile: true,
  },
})

useSeoMeta({
  title: 'FireUX Modules',
  description: 'Live inventory of FireUX modules and upcoming builds.',
})

const modules = useState<FireuxModuleRegistryDoc[]>(
  'fireux-modules-directory',
  () => []
)
</script>
