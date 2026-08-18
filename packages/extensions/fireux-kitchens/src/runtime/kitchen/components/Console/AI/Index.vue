<template>
  <section class="kitchen-ai-welcome" aria-labelledby="kitchen-ai-title">
    <Intro
      :agent-label="resolvedAgentLabel"
      :context-icon="resolvedContextIcon"
      :has-context-icon="hasContextIcon"
      :title="resolvedTitle"
      :description="resolvedDescription"
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
      :placeholder="resolvedPlaceholder"
      :suggestions="resolvedPromptSuggestions"
      :starters="resolvedStarters"
      :ai-tools="props.aiTools"
      :allow-file="allowFile"
      :command-mode="commandMode"
      :submitting="submitting"
      @submit="sendPrompt"
      @file="stageFile"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useKitchenConsole } from '../../../composables/console/core/useKitchenConsole'
import CommandResult from './CommandResult.vue'
import Composer from './Composer.vue'
import Intro from './Intro.vue'
import Messages from './Messages.vue'
import {
  useKitchenAIPresentation,
  type KitchenAIPresentationOptions,
} from './useKitchenAIPresentation'
import type {
  KitchenAICreatedObject,
  KitchenAIResultAction,
  KitchenAIToolNugget,
  KitchenAIWelcomeMessage,
} from './types'

const props = withDefaults(
  defineProps<
    KitchenAIPresentationOptions & {
      aiTools?: readonly KitchenAIToolNugget[]
    }
  >(),
  {
    starters: undefined,
    operation: '',
    aiTools: () => [],
  }
)

const { appName } = useFireUXConfig()
const kitchenConsole = useKitchenConsole()
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

const selectedLiveScope = computed(() => ({
  appId: String(kitchenConsole.runtime.appId.value || '').trim(),
  kitchenId: String(kitchenConsole.runtime.storageKitchenId.value || '').trim(),
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
  const { appId, kitchenId } = selectedLiveScope.value
  if (!appId || !kitchenId) {
    showResult(
      kitchenConsole.runtime.isDemo.value
        ? 'This Demo Kitchen is read-only. Select a Live Kitchen before running a command.'
        : 'Select or create a Live Kitchen before running a command.'
    )
    return
  }

  submitting.value = true
  try {
    const user = await useRequireUser()
    const token = await user.getIdToken()
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
    }>('/api/console/kitchen/agent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        appId,
        kitchenId,
        prompt: text,
        ...(resolvedOperation.value
          ? { operation: resolvedOperation.value }
          : {}),
        ...(pendingTool.value ? { pendingTool: pendingTool.value } : {}),
      },
    })
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

<style src="./welcome.css"></style>
