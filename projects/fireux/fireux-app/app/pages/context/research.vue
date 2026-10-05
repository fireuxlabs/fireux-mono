<template>
  <main class="mx-auto max-w-3xl space-y-8 px-6 py-12">
    <header class="space-y-3">
      <UButton to="/context" variant="link" icon="i-lucide-arrow-left"
        >FireUX context</UButton
      >
      <h1 class="text-3xl font-semibold">{{ context.title }}</h1>
      <p class="text-muted">{{ context.summary }}</p>
    </header>
    <section class="space-y-3" aria-labelledby="research-inputs">
      <h2 id="research-inputs" class="text-xl font-semibold">
        Start with the scope and evidence
      </h2>
      <ul class="list-disc space-y-2 pl-5">
        <li v-for="input in context.inputs" :key="input">{{ input }}</li>
      </ul>
    </section>
    <ol class="space-y-6">
      <li
        v-for="(step, index) in context.steps"
        :key="step.id"
        class="space-y-2"
      >
        <h2 class="text-xl font-semibold">{{ index + 1 }}. {{ step.title }}</h2>
        <p class="text-muted">{{ step.instruction }}</p>
      </li>
    </ol>
    <section class="space-y-3" aria-labelledby="research-output">
      <h2 id="research-output" class="text-xl font-semibold">
        A reviewable result
      </h2>
      <ul class="list-disc space-y-2 pl-5">
        <li v-for="output in context.outputs" :key="output">{{ output }}</li>
      </ul>
      <p class="text-sm text-muted">{{ context.maintenance }}</p>
    </section>
    <section class="space-y-3" aria-labelledby="research-reuse">
      <h2 id="research-reuse" class="text-xl font-semibold">
        Use this with your AI
      </h2>
      <p>
        Add the instruction and your scoped evidence to the research request.
      </p>
      <p class="text-sm text-muted">{{ context.consumption.boundary }}</p>
      <div class="flex flex-wrap gap-2">
        <UButton icon="i-lucide-copy" @click="copyInstruction">{{
          copyStatus === 'copied' ? 'Copied' : 'Copy research instruction'
        }}</UButton>
        <UButton :to="context.consumption.endpoint" variant="soft"
          >Read context JSON</UButton
        >
        <UButton to="/search-demand" variant="outline"
          >View Project research</UButton
        >
      </div>
      <p v-if="copyStatus === 'failed'" role="status" class="text-sm">
        Select and copy the instruction below.
      </p>
      <details>
        <summary class="cursor-pointer text-sm text-muted">
          Read the reusable instruction
        </summary>
        <UTextarea
          :model-value="context.instruction"
          readonly
          :rows="16"
          class="mt-3 w-full"
          aria-label="Reusable research instruction"
        />
      </details>
    </section>
  </main>
</template>
<script setup lang="ts">
import { readIndustryResearchContext } from 'fireux-ai/runtime/utils/industry-research-context'
const context = readIndustryResearchContext()
const copyStatus = ref<'idle' | 'copied' | 'failed'>('idle')
async function copyInstruction() {
  try {
    await navigator.clipboard.writeText(context.instruction)
    copyStatus.value = 'copied'
  } catch {
    copyStatus.value = 'failed'
  }
}
definePageMeta({ layout: 'landing' })
useSeoMeta({ title: context.title, description: context.summary })
</script>
