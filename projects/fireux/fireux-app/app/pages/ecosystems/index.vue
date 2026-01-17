<template>
  <main class="space-y-10 py-10">
    <header class="space-y-4 text-center md:text-left">
      <p class="text-xs uppercase tracking-[0.25em] text-primary/70">
        FireUX Platform
      </p>
      <div class="space-y-2">
        <h1 class="text-3xl font-semibold text-primary-foreground">
          Ecosystems Overview
        </h1>
        <p class="text-base text-muted-foreground">
          Snapshot of every tenant ecosystem, their installed modules, and
          ownership. This keeps app-driven configuration visible to the entire
          platform.
        </p>
      </div>
    </header>

    <section class="space-y-4">
      <h2 class="text-xl font-medium text-primary-foreground">
        Active ecosystems
      </h2>
      <p class="text-sm text-muted-foreground">
        Cleanbox, Misebox, and Richie can each toggle modules independently. Use
        this table to audit parity and ensure required modules are enabled
        before deploys.
      </p>

      <div class="overflow-hidden rounded-2xl border border-border/70">
        <table class="w-full text-sm">
          <thead class="bg-muted/70 text-left text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">Ecosystem</th>
              <th class="px-4 py-3 font-medium">Stage</th>
              <th class="px-4 py-3 font-medium">Owner</th>
              <th class="px-4 py-3 font-medium">Modules</th>
              <th class="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody class="bg-card">
            <tr
              v-for="eco in ecosystems"
              :key="eco.id"
              class="border-t border-border/60"
            >
              <td class="px-4 py-4">
                <p class="text-lg font-semibold text-primary-foreground">
                  {{ eco.name }}
                </p>
                <p class="text-xs uppercase tracking-[0.3em] text-primary/60">
                  {{ eco.slug }}
                </p>
              </td>
              <td class="px-4 py-4">
                <span
                  class="rounded-full border px-3 py-1 text-xs"
                  :class="
                    eco.stage === 'active'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200'
                  "
                >
                  {{ eco.stage }}
                </span>
              </td>
              <td class="px-4 py-4 text-primary-foreground">{{ eco.owner }}</td>
              <td class="px-4 py-4">
                <ul class="flex flex-wrap gap-2 text-xs">
                  <li
                    v-for="mod in eco.modules"
                    :key="mod"
                    class="rounded-full bg-muted px-3 py-1 text-primary-foreground"
                  >
                    {{ mod }}
                  </li>
                </ul>
              </td>
              <td class="px-4 py-4 text-muted-foreground">{{ eco.notes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-medium text-primary-foreground">
        Registry alignment
      </h2>
      <p class="text-sm text-muted-foreground">
        Use <code>pnpm registry:list</code> to validate that each ecosystem has
        a matching entry under <code>registry/ecosystem/&lt;slug&gt;</code> with
        the same module selections.
      </p>
      <ol class="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>
          Generate or sync each ecosystem&apos;s <code>registry.json</code>.
        </li>
        <li>Run <code>pnpm registry:register &lt;path&gt;</code> to upsert.</li>
        <li>Re-run this page (or /dev/modules once built) to ensure parity.</li>
      </ol>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { FireuxEcosystemRegistryDoc } from 'fireux-core/runtime/models/core/ecosystem.model'
import { useState } from 'nuxt/app'

type EcosystemStage = 'active' | 'rolling'

interface FireuxEcosystemRow extends FireuxEcosystemRegistryDoc {
  id: string
  slug: string
  stage: EcosystemStage
  modules: string[]
  owner: string
  notes?: string
}

definePageMeta({
  nav: {
    key: 'ecosystems',
    label: 'Ecosystems',
    icon: 'i-lucide-orbit',
    desktop: true,
    mobile: true,
  },
})

useSeoMeta({
  title: 'FireUX Ecosystems',
  description: 'Tenant ecosystem inventory with module selections.',
})

const ecosystems = useState<FireuxEcosystemRow[]>(
  'fireux-ecosystems-directory',
  () => []
)
</script>
