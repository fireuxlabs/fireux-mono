<template>
  <section
    class="grid gap-3 rounded-xl border border-default bg-elevated/30 p-4 sm:p-5"
  >
    <WorkspaceKitchenAIWelcome
      :agent="agent"
      :agent-label="agent.name"
      :title="`Work with ${title} AI`"
      :description="`Ask about the selected Kitchen's ${title.toLowerCase()} and available tools.`"
      :placeholder="`Ask ${title} AI…`"
      :prompt-suggestions="promptSuggestions"
      :allow-file="false"
    />

    <section
      v-if="showSuggestionCards && suggestions.length"
      class="grid gap-3 border-t border-default pt-4"
      :aria-labelledby="`${operation}-suggestions-title`"
    >
      <div class="grid gap-1">
        <h3
          :id="`${operation}-suggestions-title`"
          class="m-0 text-sm font-semibold text-highlighted"
        >
          Suggestions from current {{ title.toLowerCase() }}
        </h3>
        <p class="m-0 text-sm text-muted">
          These were deduced from the selected Kitchen's current data. Nothing
          changes until you choose an action.
        </p>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <UCard v-for="suggestion in suggestions" :key="suggestion.id">
          <div class="grid gap-3">
            <div class="grid gap-1">
              <h4 class="m-0 font-semibold text-highlighted">
                {{ suggestion.title }}
              </h4>
              <p class="m-0 text-sm text-muted">
                {{ suggestion.description }}
              </p>
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
    </section>

    <UAlert
      v-else-if="!suggestions.length"
      color="neutral"
      variant="soft"
      title="No contextual suggestions yet"
      description="Suggestions appear only when the current information and available tools support a specific next step. Requested tools remain roadmap context and cannot be executed."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOperationCapabilitySlug } from '../../../models/operation-capabilities'
import type { KitchenOperationSuggestion } from '../../../models/operation-suggestions'
import { kitchenOperationAgents } from '../../../models/operation-agents'
import { kitchenOperations } from '../../../models/operations'

const props = withDefaults(
  defineProps<{
    operation: KitchenOperationCapabilitySlug
    suggestions?: KitchenOperationSuggestion[]
    showSuggestionCards?: boolean
  }>(),
  {
    suggestions: () => [],
    showSuggestionCards: true,
  }
)
const title = computed(
  () =>
    kitchenOperations.find((entry) => entry.slug === props.operation)?.title ||
    props.operation
)
const agent = computed(() => {
  const match = kitchenOperationAgents.find(
    (candidate) => candidate.operationSlug === props.operation
  )
  if (!match)
    throw new Error(`Kitchen ${props.operation} AI is not registered.`)
  return match
})
const promptSuggestions = computed(() =>
  props.suggestions.length
    ? props.suggestions.map((suggestion) => suggestion.title)
    : [
        `Review my ${title.value.toLowerCase()} and suggest the next useful step.`,
      ]
)
</script>
