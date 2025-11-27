<script setup lang="ts">
import { computed } from 'vue'
import { queryContent } from '#imports'

const { data, pending, error } = await useAsyncData('fireux-figma-guide', () =>
  queryContent()
    .where({ _source: 'catalogue', _file: '10-core/figma.md' })
    .findOne()
)

const doc = computed(() => data.value ?? null)

useHead({
  title: 'FireUX Figma Workflow Guide',
})
</script>

<template>
  <main class="mx-auto w-full max-w-5xl px-6 py-12">
    <h1 class="mb-6 text-3xl font-semibold text-slate-900 dark:text-slate-100">
      FireUX Figma Workflow Guide
    </h1>

    <p v-if="pending" class="text-slate-500 dark:text-slate-400">
      Loading guide…
    </p>

    <p v-else-if="error" class="text-rose-600 dark:text-rose-400">
      We couldn’t load the FireUX Figma guide. Please retry later.
    </p>

    <p v-else-if="!doc" class="text-slate-500 dark:text-slate-400">
      Guide source not found in documentation catalogue.
    </p>

    <ContentRendererMarkdown
      v-else
      class="prose prose-slate max-w-none dark:prose-invert"
      :value="doc.body"
    />
  </main>
</template>
