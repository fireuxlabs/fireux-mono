<template>
  <UPage>
    <UPageHeader :title="context.title" :description="context.summary">
      <template #headline>
        <UButton to="/context" variant="link" icon="i-lucide-arrow-left">
          FireUX context
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageSection title="Start with the scope and evidence">
        <ul class="industry-research__list">
          <li v-for="input in context.inputs" :key="input">{{ input }}</li>
        </ul>
      </UPageSection>

      <UPageSection title="Research steps">
        <ol class="industry-research__steps">
          <li
            v-for="(step, index) in context.steps"
            :key="step.id"
            class="industry-research__step"
          >
            <h2>{{ index + 1 }}. {{ step.title }}</h2>
            <p>{{ step.instruction }}</p>
          </li>
        </ol>
      </UPageSection>

      <UPageSection title="A reviewable result">
        <ul class="industry-research__list">
          <li v-for="output in context.outputs" :key="output">
            {{ output }}
          </li>
        </ul>
        <p class="industry-research__note">{{ context.maintenance }}</p>
      </UPageSection>

      <UPageSection title="Use this with your AI">
        <p>
          Add the instruction and your scoped evidence to the research request.
        </p>
        <p class="industry-research__note">
          {{ context.consumption.boundary }}
        </p>
        <div class="industry-research__actions">
          <UButton icon="i-lucide-copy" @click="copyInstruction">
            {{
              copyStatus === 'copied' ? 'Copied' : 'Copy research instruction'
            }}
          </UButton>
          <UButton :to="context.consumption.endpoint" variant="soft">
            Read context JSON
          </UButton>
          <UButton to="/search-demand" variant="outline">
            View Project research
          </UButton>
        </div>
        <p v-if="copyStatus === 'failed'" role="status">
          Select and copy the instruction below.
        </p>
        <details class="industry-research__instruction-details">
          <summary>Read the reusable instruction</summary>
          <UTextarea
            :model-value="context.instruction"
            readonly
            :rows="16"
            class="industry-research__instruction"
            aria-label="Reusable research instruction"
          />
        </details>
      </UPageSection>
    </UPageBody>
  </UPage>
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

<style scoped>
.industry-research__list {
  display: grid;
  gap: 0.5rem;
  list-style: disc;
  padding-inline-start: 1.25rem;
}

.industry-research__steps {
  display: grid;
  gap: 1.5rem;
  list-style: none;
  padding: 0;
}

.industry-research__step h2,
.industry-research__step p {
  margin: 0;
}

.industry-research__step h2 {
  margin-bottom: 0.5rem;
}

.industry-research__note {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}

.industry-research__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.industry-research__instruction-details {
  display: grid;
  gap: 0.75rem;
}

.industry-research__instruction-details > summary {
  cursor: pointer;
}

.industry-research__instruction {
  width: 100%;
}
</style>
