import { computed } from 'vue'
import type { FireuxOperationAgentDefinition } from 'fireux-ai/runtime/models/agents/operation-agent'
import type { KitchenAIStarter } from './types'

export type KitchenAIPresentationContext = {
  promptSuggestions?: readonly string[]
}

export type KitchenAIPresentationOptions = {
  title?: string
  description?: string
  placeholder?: string
  allowFile?: boolean
  starters?: readonly KitchenAIStarter[]
  operation?: string
  mode?: 'assistant' | 'command'
  agentLabel?: string
  contextIcon?: string
  context?: KitchenAIPresentationContext
  promptSuggestions?: readonly string[]
  agent?: FireuxOperationAgentDefinition
}

const defaultStarters: readonly KitchenAIStarter[] = [
  {
    label: 'Upload my menu',
    prompt: 'I have an existing menu I want to turn into a working Kitchen.',
    icon: 'i-lucide-file-up',
  },
  {
    label: 'Try a Demo Kitchen',
    prompt: 'Show me an example Kitchen so I can explore the Workspace.',
    icon: 'i-lucide-chef-hat',
  },
  {
    label: 'Start from scratch',
    prompt: 'Help me create a new Kitchen from scratch.',
    icon: 'i-lucide-plus',
  },
] as const

export function useKitchenAIPresentation(
  options: Readonly<KitchenAIPresentationOptions>,
  appName: string
) {
  return {
    operation: computed(
      () => options.agent?.operationSlug || options.operation || ''
    ),
    agentLabel: computed(
      () => options.agentLabel ?? `Kitchen AI powered by ${appName}`
    ),
    hasContextIcon: computed(() => Boolean(options.contextIcon)),
    contextIcon: computed(() => options.contextIcon || 'i-lucide-sparkles'),
    title: computed(
      () => options.title ?? 'How can I help your kitchen today?'
    ),
    description: computed(
      () =>
        options.description ??
        'Give me your existing menu and I’ll help turn it into a working digital Menu and Kitchen Workspace.'
    ),
    placeholder: computed(() => options.placeholder || 'Ask Kitchen AI…'),
    promptSuggestions: computed(
      () =>
        options.context?.promptSuggestions || options.promptSuggestions || []
    ),
    allowFile: computed(() => options.allowFile ?? true),
    starters: computed(
      () => options.starters ?? (options.agent ? [] : defaultStarters)
    ),
    commandMode: computed(
      () =>
        (options.mode ?? (options.agent ? 'command' : 'assistant')) ===
        'command'
    ),
  }
}
