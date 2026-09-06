<template>
  <div class="space-y-8">
    <section class="space-y-5" aria-label="Workspace introduction">
      <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
        <UIcon :name="icon" class="size-4" />
        <span>{{ label }}</span>
        <UBadge color="neutral" variant="subtle" size="sm">{{
          selectedName || 'Your space to begin'
        }}</UBadge>
      </div>
      <div class="max-w-3xl space-y-3">
        <h1
          class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl"
        >
          {{ title }}
        </h1>
        <p class="max-w-2xl text-base text-toned">{{ description }}</p>
      </div>
      <WorkspaceAIComposer
        v-model="draft"
        :placeholder="placeholder"
        :can-submit="Boolean(draft.trim())"
        :suggestions="prompts.map((label) => ({ label }))"
        aria-label="Describe what you want to work on"
        suggestions-aria-label="Ways to get started"
        @select-suggestion="draft = $event.label"
        @submit="reviewing = true"
      >
        <template #leading
          ><span class="px-2 text-xs text-muted"
            >Start with a brief. Make it yours.</span
          ></template
        >
        <template #submit
          ><UButton
            type="submit"
            :disabled="!draft.trim()"
            label="Review brief"
            icon="i-lucide-arrow-up"
            color="primary"
        /></template>
      </WorkspaceAIComposer>
      <UCard v-if="reviewing" aria-label="Your workspace brief">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-semibold">Your next move</h2>
            <UBadge color="neutral" variant="soft">Draft</UBadge>
          </div>
        </template>
        <p class="whitespace-pre-wrap text-sm text-toned">{{ draft }}</p>
        <p class="mt-4 text-sm text-muted">
          Choose a tool below to continue. This is a working draft; no workspace
          records have changed.
        </p>
        <template #footer
          ><UButton
            label="Keep editing"
            variant="ghost"
            color="neutral"
            @click="reviewing = false"
        /></template>
      </UCard>
    </section>

    <section class="space-y-3" aria-label="Workspace record controls">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium text-muted">{{ recordLabel }}</h2>
        <UButton
          v-if="selectedName"
          :to="overviewTo"
          label="Overview"
          icon="i-lucide-arrow-up-right"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>
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
          Start a brief that brings several tools together.
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
                label="Start a brief"
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
  selectedName?: string
  scopeKey: string
  recordLabel: string
  overviewTo: string
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
const reviewing = ref(false)
watch(
  () => props.scopeKey,
  (key: string) => {
    draft.value = drafts.value[key] || ''
    reviewing.value = false
  }
)
watch(draft, (value: string) => {
  drafts.value[props.scopeKey] = value
})
const emit = defineEmits<{
  state: [value: { draft: string; reviewing: boolean }]
}>()
watchEffect(() =>
  emit('state', { draft: draft.value, reviewing: reviewing.value })
)
function start(value: string) {
  draft.value = value
  reviewing.value = true
  if (import.meta.client)
    document
      .querySelector('[aria-label="Workspace introduction"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
