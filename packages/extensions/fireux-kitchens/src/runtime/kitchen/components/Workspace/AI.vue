<template>
  <section class="kitchen-ai-welcome" aria-labelledby="kitchen-ai-title">
    <Intro
      :agent-label="resolvedAgentLabel"
      :context-icon="resolvedContextIcon"
      :has-context-icon="hasContextIcon"
      :title="workspaceTitle"
      :description="workspaceDescription"
    />

    <Messages
      v-if="!commandMode && messages.length"
      :messages="messages"
      @copy="copyResultAction"
    />

    <CommandResult
      v-if="commandMode && commandResult"
      :result="commandResult"
      :pending="Boolean(pendingTool)"
      :submitting="submitting"
      @confirm="confirmCommand"
      @reset="resetCommand"
      @copy="copyResultAction"
    />

    <Composer
      v-if="!commandMode || !commandResult"
      v-model="prompt"
      :placeholder="workspacePlaceholder"
      :suggestions="promptSuggestions"
      :starters="resolvedStarters"
      :ai-tools="props.aiTools"
      :allow-file="allowFile"
      :aria-label="composerAriaLabel"
      :submitting="submitting"
      @submit="sendPrompt"
      @file="stageFile"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceTools } from '../../composables/workspace/index/useKitchenWorkspaceTools'
import CommandResult from './AI/CommandResult.vue'
import Composer from './AI/Composer.vue'
import Intro from './AI/Intro.vue'
import Messages from './AI/Messages.vue'
import {
  useKitchenAIPresentation,
  type KitchenAIPresentationOptions,
} from './AI/useKitchenAIPresentation'
import type {
  KitchenAICreatedObject,
  KitchenAIResultAction,
  KitchenAIToolNugget,
  KitchenAIWelcomeMessage,
  KitchenCapabilityActionTarget,
} from './AI/types'

const props = withDefaults(
  defineProps<
    KitchenAIPresentationOptions & {
      aiTools?: readonly KitchenAIToolNugget[]
      availableActions?: readonly string[]
      actionTargets?: readonly KitchenCapabilityActionTarget[]
      performAction?: (
        id: string,
        targetId?: string
      ) => boolean | Promise<boolean>
    }
  >(),
  {
    starters: undefined,
    operation: '',
    aiTools: () => [],
    availableActions: () => [],
    actionTargets: () => [],
    performAction: undefined,
  }
)

const { appId: configuredAppId, appName } = useFireUXConfig()
const kitchenWorkspace = useKitchenWorkspace()
const {
  workspacePending,
  suggestions: workspaceToolSuggestions,
  availableActions: availableWorkspaceActions,
  performAction: performWorkspaceAction,
} = useKitchenWorkspaceTools(kitchenWorkspace)
const {
  agentLabel: resolvedAgentLabel,
  hasContextIcon,
  contextIcon: resolvedContextIcon,
  title: resolvedTitle,
  description: resolvedDescription,
  placeholder: resolvedPlaceholder,
  promptSuggestions: resolvedPromptSuggestions,
  allowFile,
  starters: resolvedStarters,
  commandMode,
  operation: resolvedOperation,
} = useKitchenAIPresentation(props, appName)
const availableActions = computed(() =>
  resolvedOperation.value
    ? props.availableActions
    : availableWorkspaceActions.value
)
const performAction = (id: string, targetId = '') =>
  resolvedOperation.value && props.performAction
    ? props.performAction(id, targetId)
    : performWorkspaceAction(id)
const promptSuggestions = computed(() =>
  resolvedPromptSuggestions.value.length || resolvedOperation.value
    ? resolvedPromptSuggestions.value
    : workspaceToolSuggestions.value
)
const prompt = ref('')
const messages = ref<KitchenAIWelcomeMessage[]>([])
const submitting = ref(false)
const commandResult = ref<KitchenAIWelcomeMessage | null>(null)
const pendingTool = ref<{
  id: string
  name: string
  input: Record<string, unknown>
  confirmation: string
} | null>(null)
let messageId = 0
const composerAriaLabel = computed(
  () => `Ask ${props.agent?.name || 'KitchenAI'}`
)

const selectedKitchenName = computed(() =>
  String(
    kitchenWorkspace.selection.kitchen.value?.name ||
      kitchenWorkspace.selection.kitchen.value?.slug ||
      ''
  ).trim()
)
const workspaceTitle = computed(() => {
  if (props.agent || resolvedOperation.value) return resolvedTitle.value
  if (workspacePending.value) return 'Build and run your Kitchen with KitchenAI'
  return selectedKitchenName.value
    ? `Run ${selectedKitchenName.value} with KitchenAI`
    : 'Tell us about your Kitchen'
})
const workspacePlaceholder = computed(() => {
  if (
    props.agent ||
    resolvedOperation.value ||
    workspacePending.value ||
    selectedKitchenName.value
  ) {
    return resolvedPlaceholder.value
  }
  return 'Tell us about your Kitchen…'
})
const workspaceDescription = computed(() => {
  if (props.description || props.agent) return resolvedDescription.value
  if (workspacePending.value) {
    return 'Describe, create and run your Kitchen from one conversation.'
  }

  const selectedName = selectedKitchenName.value
  if (selectedName) {
    return `Build ${selectedName} with menus, dishes, recipes, prep, and the tools available now.`
  }

  const outcome = kitchenWorkspace.targets.outcome.value
  if (outcome === 'pending' || outcome === 'idle') {
    return 'I am checking which Kitchens are available to you.'
  }
  if (outcome === 'error') {
    return 'I could not load your available Kitchens. You can still begin from a blank Kitchen context.'
  }

  return 'Describe your Kitchen in your own words. KitchenAI can help you start with its name.'
})

const selectedLiveScope = computed(() => ({
  appId: String(kitchenWorkspace.runtime.appId.value || '').trim(),
  kitchenId: String(
    kitchenWorkspace.runtime.storageKitchenId.value || ''
  ).trim(),
}))

function pushMessage(
  role: KitchenAIWelcomeMessage['role'],
  text: string,
  options: Pick<KitchenAIWelcomeMessage, 'createdObject' | 'resultAction'> = {}
) {
  messages.value.push({ id: ++messageId, role, text, ...options })
}

async function sendPrompt() {
  const text = prompt.value.trim()
  if (!text || submitting.value) return
  if (!commandMode.value) pushMessage('user', text)
  prompt.value = ''
  await runPrompt(text)
}

async function runPrompt(text: string) {
  const selected = selectedLiveScope.value
  const appId = selected.appId || configuredAppId
  const kitchenId = selected.kitchenId
  if (!appId) {
    showResult('KitchenAI is not available for this App.')
    return
  }

  submitting.value = true
  try {
    const headers: Record<string, string> = {}
    const user = await useRequireUser()
    headers.Authorization = `Bearer ${await user.getIdToken()}`
    const response = await $fetch<{
      ok: true
      answer: string
      pendingTool?: {
        id: string
        name: string
        input: Record<string, unknown>
        confirmation: string
      }
      createdObject?: KitchenAICreatedObject
      resultAction?: KitchenAIResultAction
      workspaceAction?: { id: string; targetId?: string }
    }>('/api/workspace/kitchen/agent', {
      method: 'POST',
      headers,
      body: {
        appId,
        ...(kitchenId ? { kitchenId } : {}),
        prompt: text,
        ...(resolvedOperation.value
          ? { operation: resolvedOperation.value }
          : {}),
        ...(pendingTool.value ? { pendingTool: pendingTool.value } : {}),
        ...(availableActions.value.length
          ? { availableActions: availableActions.value }
          : {}),
        ...(props.actionTargets.length
          ? { actionTargets: props.actionTargets }
          : {}),
      },
    })
    if (
      response.workspaceAction?.id &&
      (await performAction(
        response.workspaceAction.id,
        response.workspaceAction.targetId
      ))
    ) {
      if (response.answer) showResult(response.answer)
      return
    }
    pendingTool.value = response.pendingTool || null
    showResult(response.answer, {
      createdObject: response.createdObject,
      resultAction: response.resultAction,
    })
  } catch (error) {
    const failure = error as {
      data?: { statusMessage?: string; message?: string }
      message?: string
    }
    pendingTool.value = null
    showResult(
      failure.data?.statusMessage ||
        failure.data?.message ||
        failure.message ||
        'This command could not be prepared.'
    )
  } finally {
    submitting.value = false
  }
}

function showResult(
  text: string,
  options: Pick<KitchenAIWelcomeMessage, 'createdObject' | 'resultAction'> = {}
) {
  if (commandMode.value) {
    commandResult.value = {
      id: ++messageId,
      role: 'assistant',
      text,
      ...options,
    }
  } else pushMessage('assistant', text, options)
}

async function confirmCommand() {
  if (!pendingTool.value || submitting.value) return
  await runPrompt('confirm')
}

function resetCommand() {
  pendingTool.value = null
  commandResult.value = null
  prompt.value = ''
}

async function copyResultAction(action: KitchenAIResultAction) {
  const value = new URL(action.value, window.location.origin).toString()
  await navigator.clipboard.writeText(value)
  useToast().add({ title: 'Invitation link copied', color: 'success' })
}

function stageFile(file: File) {
  pushMessage('user', `Use my menu: ${file.name}`)
  pushMessage(
    'assistant',
    `I can see ${file.name}. File analysis is not connected in this prototype, so the file has not left your browser.`
  )
}
</script>

<style src="./AI/welcome.css"></style>
