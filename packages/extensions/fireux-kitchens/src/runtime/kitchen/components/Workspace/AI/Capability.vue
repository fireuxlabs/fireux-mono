<template>
  <section class="grid gap-3">
    <WorkspaceKitchenAIAssistant
      :kitchen-id="kitchenId || ''"
      compact
      :show-intro="false"
      :agent="agent"
      :agent-label="agent.name"
      :title="`Work with ${title} AI`"
      :description="`Ask about the selected Kitchen's ${title.toLowerCase()} and available tools.`"
      :placeholder="`Ask ${title} AI…`"
      :prompt-suggestions="promptSuggestions"
      :available-actions="resolvedAvailableActions"
      :action-targets="actionTargets"
      :perform-action="performAction"
      :allow-file="false"
    />

    <section
      v-if="showSuggestionCards && suggestions.length"
      class="grid gap-3 border-t border-default pt-4"
      :aria-labelledby="`${capability}-suggestions-title`"
    >
      <div class="grid gap-1">
        <h3
          :id="`${capability}-suggestions-title`"
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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import type { KitchenCapabilitySlug } from '../../../models/capability-tools'
import type { KitchenCapabilitySuggestion } from '../../../models/capability-suggestions'
import type { KitchenCapabilityActionTarget } from '../../../models/kitchen-ai-presentation.model'
import { kitchenCapabilityAgents } from '../../../models/capability-agents'
import { kitchenCapabilities } from '../../../models/capabilities'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const props = withDefaults(
  defineProps<{
    capability: KitchenCapabilitySlug
    suggestions?: KitchenCapabilitySuggestion[]
    actionTargets?: KitchenCapabilityActionTarget[]
    showSuggestionCards?: boolean
  }>(),
  {
    suggestions: () => [],
    actionTargets: () => [],
    showSuggestionCards: true,
  }
)
const { selectedId: kitchenId } = useWorkspace('kitchen')
const title = computed(
  () =>
    kitchenCapabilities.find((entry) => entry.slug === props.capability)
      ?.title ||
    (props.capability === 'identity' ? 'Identity' : props.capability)
)
const agent = computed(() => {
  const match = kitchenCapabilityAgents.find(
    (candidate) => candidate.operationSlug === props.capability
  )
  if (!match)
    throw new Error(`Kitchen ${props.capability} AI is not registered.`)
  return match
})
const { availableActions, performAction } = useKitchenCapabilityTools(
  props.capability
)
const actionTargets = computed(() => props.actionTargets)
const resolvedAvailableActions = computed(() => [
  ...availableActions.value,
  ...new Set(props.actionTargets.map((target) => target.actionId)),
])
const promptSuggestions = computed(() =>
  props.suggestions.length
    ? props.suggestions.map((suggestion) => suggestion.title)
    : [
        `Review my ${title.value.toLowerCase()} and suggest the next useful step.`,
      ]
)
</script>
