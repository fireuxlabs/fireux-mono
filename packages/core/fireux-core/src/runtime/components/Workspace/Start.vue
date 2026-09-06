<template>
  <div class="space-y-8">
    <section class="space-y-5" aria-label="Workspace introduction">
      <div
        class="mx-auto flex w-full max-w-3xl flex-col gap-5 py-6 sm:gap-6 sm:py-10"
      >
        <div class="space-y-3 text-center">
          <h1
            class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl"
          >
            {{ title }}
          </h1>
          <p class="mx-auto max-w-xl text-base text-muted">{{ description }}</p>
        </div>
        <WorkspaceAIComposer
          v-model="draft"
          spacious
          :placeholder="placeholder"
          :can-submit="Boolean(draft.trim())"
          :suggestions="prompts.map((label) => ({ label }))"
          aria-label="Describe what you want to work on"
          suggestions-aria-label="Ways to get started"
          @select-suggestion="draft = $event.label"
          @submit="sendAttempted = true"
        >
          <template #leading><span /></template>
          <template #submit
            ><UButton
              type="submit"
              :disabled="!draft.trim()"
              aria-label="Send message"
              icon="i-lucide-arrow-up"
              color="primary"
          /></template>
        </WorkspaceAIComposer>
        <UButton
          v-if="continueLabel && draft.trim()"
          :label="continueLabel"
          trailing-icon="i-lucide-arrow-right"
          variant="link"
          class="self-center"
          @click="emit('continue', draft)"
        />
        <p
          v-if="sendAttempted"
          role="status"
          class="text-center text-sm text-muted"
        >
          AI isn’t connected here yet. Your message is still here.
        </p>
      </div>
    </section>

    <section class="space-y-3" aria-label="Workspace record controls">
      <slot name="primitives" />
    </section>

    <section class="space-y-4" aria-label="Workspace tools">
      <div>
        <h2 class="text-lg font-semibold">{{ toolsTitle }}</h2>
        <p class="mt-1 text-sm text-muted">{{ toolsDescription }}</p>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <UPageCard
          v-for="tool in tools"
          :key="tool.to"
          :title="tool.label"
          :description="tool.description"
          :icon="tool.icon"
          :to="tool.to"
          variant="outline"
          :ui="{ title: 'text-base', description: 'text-sm' }"
        />
      </div>
    </section>

    <section class="space-y-4" aria-label="Workflow starters">
      <div>
        <h2 class="text-lg font-semibold">{{ workflowsTitle }}</h2>
        <p class="mt-1 text-sm text-muted">
          Explore work that brings several tools together.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <UCard v-for="workflow in workflows" :key="workflow.label">
          <div class="flex items-start gap-3">
            <UIcon
              :name="workflow.icon"
              class="mt-1 size-5 shrink-0 text-primary"
            />
            <div class="space-y-2">
              <h3 class="font-medium">{{ workflow.label }}</h3>
              <p class="text-sm text-muted">{{ workflow.description }}</p>
              <UButton
                label="Try this"
                trailing-icon="i-lucide-arrow-right"
                variant="link"
                @click="start(workflow.prompt)"
              />
            </div>
          </div>
        </UCard>
      </div>
    </section>
    <p v-if="!selectedName" class="text-sm text-muted">
      Explore the tools now. Sign in when you’re ready to save your work.
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { useState } from '#imports'
import WorkspaceAIComposer from './AI/Composer.vue'
const props = defineProps<{
  label: string
  icon: string
  title: string
  description: string
  placeholder: string
  continueLabel?: string
  selectedName?: string
  scopeKey: string
  prompts: string[]
  toolsTitle: string
  toolsDescription: string
  workflowsTitle: string
  tools: { label: string; description: string; icon: string; to: string }[]
  workflows: {
    label: string
    description: string
    icon: string
    prompt: string
  }[]
}>()
const drafts = useState<Record<string, string>>(
  'workspace-start-drafts',
  () => ({})
)
const draft = ref(drafts.value[props.scopeKey] || '')
const sendAttempted = ref(false)
watch(
  () => props.scopeKey,
  (key: string) => {
    draft.value = drafts.value[key] || ''
    sendAttempted.value = false
  }
)
watch(draft, (value: string) => {
  drafts.value[props.scopeKey] = value
})
const emit = defineEmits<{
  continue: [draft: string]
  state: [value: { draft: string; sendAttempted: boolean }]
}>()
watchEffect(() =>
  emit('state', { draft: draft.value, sendAttempted: sendAttempted.value })
)
function start(value: string) {
  draft.value = value
  sendAttempted.value = false
  if (import.meta.client)
    document
      .querySelector('[aria-label="Workspace introduction"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
