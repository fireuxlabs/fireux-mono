<script setup lang="ts">
import { computed } from 'vue'
import { queryContent } from '#imports'

const { data, pending, error } = await useAsyncData('fireux-image-spec', () =>
  queryContent().where({ _source: 'core', _file: 'images.md' }).findOne()
)

const doc = computed(() => data.value ?? null)

useHead({
  title: 'FireUX Image System — Specification',
})
</script>

<template>
  <main class="mx-auto w-full max-w-5xl px-6 py-12">
    <h1 class="mb-6 text-3xl font-semibold text-slate-900 dark:text-slate-100">
      FireUX Image System — Specification
    </h1>

    <p v-if="pending" class="text-slate-500 dark:text-slate-400">
      Loading specification…
    </p>

    <p v-else-if="error" class="text-rose-600 dark:text-rose-400">
      We couldn’t load the FireUX image specification. Please retry later.
    </p>

    <p v-else-if="!doc" class="text-slate-500 dark:text-slate-400">
      Spec source not found in fireux-core.
    </p>

    <ContentRendererMarkdown
      v-else
      class="prose prose-slate max-w-none dark:prose-invert"
      :value="doc.body"
    />
  </main>
</template>
