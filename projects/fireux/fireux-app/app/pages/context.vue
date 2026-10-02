<template>
  <main class="mx-auto max-w-3xl space-y-8 px-6 py-12">
    <header class="space-y-3">
      <h1 class="text-3xl font-semibold">FireUX context</h1>
      <p>{{ context.summary }}</p>
    </header>
    <section class="space-y-3" aria-labelledby="purpose">
      <h2 id="purpose" class="text-xl font-semibold">What we are building</h2>
      <p>{{ context.mission.intent }}</p>
      <p>{{ context.mission.whiteLabel }}</p>
      <p>{{ context.mission.example }}</p>
    </section>
    <dl class="grid gap-5 sm:grid-cols-2">
      <div v-for="(meaning, term) in context.structure" :key="term">
        <dt class="font-semibold capitalize">{{ term }}</dt>
        <dd class="text-muted">{{ meaning }}</dd>
      </div>
    </dl>
    <section class="space-y-3" aria-labelledby="consumption">
      <h2 id="consumption" class="text-xl font-semibold">Using this context</h2>
      <p>{{ context.consumption.purpose }}</p>
      <p>{{ context.consumption.boundary }}</p>
      <UButton :href="context.consumption.endpoint" variant="soft">Read public context JSON</UButton>
      <p class="text-sm text-muted">The JSON includes a schema version and content revision. Consumers choose when to read it; current records and available tools remain authoritative.</p>
    </section>
    <UButton to="/product" variant="link">Explore FireUX</UButton>
  </main>
</template>

<script setup lang="ts">
import { readPlatformContext } from 'fireux-core/runtime/utils/platform-context'
const context = readPlatformContext()
definePageMeta({ layout: 'landing' })
useSeoMeta({ title: 'FireUX context', description: context.summary })
</script>
