<template>
  <WorkspaceAI aria-label="KitchenAI" :compact="compact">
    <WorkspaceAIIntro
      v-if="showIntro"
      :agent-label="agentLabel"
      :title="title"
      :description="description"
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
      :placeholder="placeholder"
      :suggestions="promptSuggestions"
      :starters="starters"
      :ai-tools="props.aiTools"
      :allow-file="allowFile"
      :aria-label="composerAriaLabel"
      :submitting="submitting"
      @submit="sendPrompt"
      @file="stageFile"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { refreshNuxtData } from 'nuxt/app'

import { useToast } from '#imports'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import CommandResult from './CommandResult.vue'
import Composer from './Composer.vue'
import Messages from './Messages.vue'
import {
  useKitchenAIPresentation,
  type KitchenAIPresentationOptions,
} from '../../../composables/workspace/ai/useKitchenAIPresentation'
import type {
  KitchenAICreatedObject,
  KitchenAIResultAction,
  KitchenAIToolNugget,
  KitchenAIWelcomeMessage,
  KitchenCapabilityActionTarget,
} from '../../../models/kitchen-ai-presentation.model'

const props = withDefaults(
  defineProps<
    KitchenAIPresentationOptions & {
      kitchenId?: string
      compact?: boolean
      showIntro?: boolean
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
    kitchenId: '',
    compact: false,
    showIntro: true,
    aiTools: () => [],
    availableActions: () => [],
    actionTargets: () => [],
    performAction: undefined,
  }
)

const { appId: configuredAppId, appName } = useFireUXConfig()
const { currentUser } = useAuth()
const {
  agentLabel,
  title,
  description,
  placeholder,
  promptSuggestions,
  allowFile,
  starters,
  commandMode,
  operation,
} = useKitchenAIPresentation(props, appName)
const availableActions = computed(() => props.availableActions)
const performAction = (id: string, targetId = '') =>
  props.performAction ? props.performAction(id, targetId) : false
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

const selectedLiveScope = computed(() => ({
  appId: String(configuredAppId || '').trim(),
  kitchenId: String(props.kitchenId || '').trim(),
}))
let revision = 0
let active = true
watch(
  [
    () => selectedLiveScope.value.appId,
    () => selectedLiveScope.value.kitchenId,
    () => currentUser.value?.uid || '',
    operation,
  ],
  () => {
    resetCommand()
    messages.value = []
  },
  { flush: 'sync' }
)
onBeforeUnmount(() => {
  active = false
  revision += 1
})

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
  if (submitting.value || !active) return
  const selected = selectedLiveScope.value
  const appId = selected.appId || configuredAppId
  const kitchenId = selected.kitchenId
  if (!appId) {
    showResult('KitchenAI is not available for this App.')
    return
  }
  const requestedRevision = revision
  const isCurrent = () => active && requestedRevision === revision
  const request = {
    appId,
    ...(kitchenId ? { kitchenId } : {}),
    prompt: text,
    ...(operation.value ? { operation: operation.value } : {}),
    ...(pendingTool.value ? { pendingTool: pendingTool.value } : {}),
    ...(availableActions.value.length
      ? { availableActions: [...availableActions.value] }
      : {}),
    ...(props.actionTargets.length
      ? { actionTargets: props.actionTargets.map((target) => ({ ...target })) }
      : {}),
  }

  submitting.value = true
  try {
    const headers: Record<string, string> = {}
    const user = await useRequireUser()
    if (!isCurrent()) return
    headers.Authorization = `Bearer ${await user.getIdToken()}`
    if (!isCurrent()) return
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
      onResponse: async ({ options, response }) => {
        if (
          response.ok &&
          !['GET', 'HEAD'].includes(
            String(options.method || 'GET').toUpperCase()
          )
        )
          await refreshNuxtData()
      },
      method: 'POST',
      headers,
      body: request,
    })
    if (!isCurrent()) return
    if (
      response.workspaceAction?.id &&
      (await performAction(
        response.workspaceAction.id,
        response.workspaceAction.targetId
      ))
    ) {
      if (!isCurrent()) return
      if (response.answer) showResult(response.answer)
      return
    }
    if (!isCurrent()) return
    pendingTool.value = response.pendingTool || null
    showResult(response.answer, {
      createdObject: response.createdObject,
      resultAction: response.resultAction,
    })
  } catch (error) {
    if (!isCurrent()) return
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
    if (isCurrent()) submitting.value = false
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
  revision += 1
  submitting.value = false
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
