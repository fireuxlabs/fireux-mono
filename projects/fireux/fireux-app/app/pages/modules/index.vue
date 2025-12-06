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

    <section class="space-y-6">
      <div
        class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 class="text-xl font-medium text-primary-foreground">
            Active modules
          </h2>
          <p class="text-sm text-muted-foreground">
            Ready for installation today. Listed in the FireUX registry and
            installable via
            <code class="rounded bg-muted px-2 py-0.5">modules</code>
            array inside each app config.
          </p>
        </div>
        <NuxtLink class="link" to="/create-and-register">
          View creation workflow →
        </NuxtLink>
      </div>

      <ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="module in modules"
          :key="module.id"
          class="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-primary/60">
                {{ module.scope }}
              </p>
              <h3 class="text-2xl font-semibold text-primary-foreground">
                {{ module.title }}
              </h3>
            </div>
            <span
              class="rounded-full border px-3 py-1 text-xs font-medium"
              :class="
                module.status === 'active'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
              "
            >
              {{ module.status }}
            </span>
          </div>

          <p class="mt-3 text-sm text-muted-foreground">
            {{ module.description }}
          </p>

          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between text-muted-foreground">
              <dt>Owner</dt>
              <dd class="text-primary-foreground">{{ module.owner }}</dd>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <dt>Capabilities</dt>
              <dd class="text-right text-primary-foreground">
                {{ module.capabilities.join(', ') }}
              </dd>
            </div>
            <div class="flex justify-between text-muted-foreground">
              <dt>Installs</dt>
              <dd class="text-right text-primary-foreground">
                {{ module.installs.join(', ') }}
              </dd>
            </div>
          </dl>
        </li>
      </ul>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-medium text-primary-foreground">
        Incoming modules
      </h2>
      <p class="text-sm text-muted-foreground">
        Concepts that will be scaffolded through <code>create:module</code>. Use
        this list to coordinate sequencing and registry backfill work.
      </p>
      <div class="overflow-hidden rounded-xl border border-border/70">
        <table class="w-full text-sm">
          <thead class="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th class="px-4 py-3 font-medium">Module</th>
              <th class="px-4 py-3 font-medium">Owner</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Next action</th>
            </tr>
          </thead>
          <tbody class="bg-card">
            <tr
              v-for="idea in upcoming"
              :key="idea.id"
              class="border-t border-border/50"
            >
              <td class="px-4 py-3">
                <p class="font-medium text-primary-foreground">
                  {{ idea.title }}
                </p>
                <p class="text-xs text-muted-foreground">{{ idea.summary }}</p>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{{ idea.owner }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full bg-muted px-2 py-1 text-xs text-primary-foreground"
                >
                  {{ idea.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{{ idea.next }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import {
  fireuxModules,
  fireuxModuleRoadmap,
} from 'fireux-core/src/runtime/models/core/module.model'

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

const modules = fireuxModules
const upcoming = fireuxModuleRoadmap
</script>
