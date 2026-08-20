<template>
  <section
    class="grid gap-3 rounded-xl border border-default bg-elevated/30 p-4 sm:p-5"
  >
    <ConsoleKitchenAIWelcome
      :agent="agent"
      :agent-label="agent.name"
      :title="`Work with ${title} AI`"
      :description="`Ask about the selected Kitchen's ${title} records and available tools.`"
      :placeholder="`Ask ${title} AI…`"
      :prompt-suggestions="promptSuggestions"
      :allow-file="false"
    />

    <div v-if="suggestions.length" class="grid gap-3 border-t border-default pt-4 lg:grid-cols-2">
      <UCard v-for="suggestion in suggestions" :key="suggestion.id">
        <div class="grid gap-3">
          <div class="grid gap-1">
            <h3 class="m-0 font-semibold text-highlighted">
              {{ suggestion.title }}
            </h3>
            <p class="m-0 text-sm text-muted">
              {{ suggestion.description }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
            <UBadge color="neutral" variant="soft">
              {{ suggestion.evidence }}
            </UBadge>
            <code>{{ suggestion.toolId }}</code>
          </div>

          <UButton
            v-if="suggestion.actionPath"
            :to="suggestion.actionPath"
            color="neutral"
            variant="soft"
            size="sm"
            class="w-fit"
          >
            {{ suggestion.actionLabel || 'Review' }}
          </UButton>
        </div>
      </UCard>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No contextual suggestions yet"
      description="Suggestions appear only when current records and available tools support a specific next step. Requested tools remain roadmap context and cannot be executed."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOperationCapabilitySlug } from '../../../models/operation-capabilities'
import type { KitchenOperationSuggestion } from '../../../models/operation-suggestions'
import { kitchenOperationAgents } from '../../../models/operation-agents'
import { kitchenOperations } from '../../../models/operations'

const props = withDefaults(defineProps<{
  operation: KitchenOperationCapabilitySlug
  suggestions?: KitchenOperationSuggestion[]
}>(), {
  suggestions: () => [],
})
const title = computed(
  () =>
    kitchenOperations.find((entry) => entry.slug === props.operation)?.title ||
    props.operation
)
const agent = computed(() => {
  const match = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === props.operation
  )
  if (!match) throw new Error(`Kitchen ${props.operation} AI is not registered.`)
  return match
})
const promptSuggestions = computed(() =>
  props.suggestions.length
    ? props.suggestions.map((suggestion) => suggestion.title)
    : [`Review my ${title.value.toLowerCase()} and suggest the next useful step.`]
)
</script>
