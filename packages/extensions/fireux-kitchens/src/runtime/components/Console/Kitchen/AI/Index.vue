<template>
  <section class="kitchen-ai-welcome" aria-labelledby="kitchen-ai-title">
    <div class="kitchen-ai-welcome__intro">
      <div class="kitchen-ai-welcome__mark" aria-hidden="true">
        <UIcon :name="resolvedContextIcon" />
        <span v-if="hasContextIcon" class="kitchen-ai-welcome__mark-ai">
          <UIcon name="i-lucide-sparkles" />
        </span>
      </div>
      <p class="fx-type-label">
        {{ resolvedAgentLabel }}
      </p>
      <h1
        id="kitchen-ai-title"
        class="fx-type-display-title"
        v-text="resolvedTitle"
      />
      <p class="fx-type-description text-toned">
        {{ resolvedDescription }}
      </p>
    </div>

    <div
      v-if="!commandMode && messages.length"
      class="kitchen-ai-welcome__messages"
      aria-live="polite"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="kitchen-ai-welcome__message"
        :class="`kitchen-ai-welcome__message--${message.role}`"
      >
        <p>{{ message.text }}</p>
        <ConsoleKitchenAICreatedObject
          v-if="message.createdObject"
          v-bind="message.createdObject"
        />
        <UButton
          v-if="message.resultAction?.kind === 'copy'"
          class="mt-3"
          :label="message.resultAction.label"
          icon="i-lucide-copy"
          color="primary"
          variant="soft"
          size="sm"
          @click="copyResultAction(message.resultAction)"
        />
      </div>
    </div>

    <UCard
      v-if="commandMode && commandResult"
      class="kitchen-ai-command-result"
      aria-live="polite"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <UIcon
              :name="
                pendingTool ? 'i-lucide-wand-sparkles' : 'i-lucide-circle-check'
              "
              class="size-5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-dimmed"
            >
              {{ pendingTool ? 'Ready for approval' : 'Result' }}
            </p>
            <p class="mt-1 text-sm text-toned">{{ commandResult.text }}</p>
          </div>
        </div>

        <ConsoleKitchenAICreatedObject
          v-if="commandResult.createdObject"
          v-bind="commandResult.createdObject"
        />
        <UButton
          v-if="commandResult.resultAction?.kind === 'copy'"
          :label="commandResult.resultAction.label"
          icon="i-lucide-copy"
          color="primary"
          variant="soft"
          @click="copyResultAction(commandResult.resultAction)"
        />

        <div v-if="pendingTool" class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="resetCommand"
          />
          <UButton
            label="Confirm action"
            icon="i-lucide-play"
            :loading="submitting"
            @click="confirmCommand"
          />
        </div>
        <div v-else class="flex justify-end">
          <UButton
            label="New request"
            color="neutral"
            variant="ghost"
            icon="i-lucide-rotate-ccw"
            @click="resetCommand"
          />
        </div>
      </div>
    </UCard>

    <div
      v-if="!commandMode || !commandResult"
      class="kitchen-ai-welcome__starters"
      aria-label="Suggested starting points"
    >
      <UButton
        v-for="starter in resolvedStarters"
        :key="starter.label"
        :label="starter.label"
        :icon="starter.icon"
        color="neutral"
        variant="soft"
        @click="prompt = starter.prompt"
      />
    </div>

    <ToolNuggets
      v-if="props.aiTools?.length && (!commandMode || !commandResult)"
      :tools="props.aiTools"
      @select="prompt = $event"
    />

    <form
      v-if="!commandMode || !commandResult"
      class="kitchen-ai-welcome__composer"
      @submit.prevent="sendPrompt"
    >
      <input
        v-if="allowFile"
        ref="fileInput"
        class="sr-only"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
        @change="stageFile"
      />
      <UButton
        v-if="allowFile"
        icon="i-lucide-paperclip"
        color="neutral"
        variant="ghost"
        aria-label="Upload your existing menu"
        @click="fileInput?.click()"
      />
      <PromptInput
        v-model="prompt"
        class="kitchen-ai-welcome__input"
        :placeholder="resolvedPlaceholder"
        :suggestions="resolvedPromptSuggestions"
        :aria-label="commandMode ? 'Ask Team AI' : 'Ask Kitchen AI'"
      />
      <UButton
        type="submit"
        icon="i-lucide-arrow-up"
        color="primary"
        :loading="submitting"
        :disabled="!prompt.trim() || submitting"
        aria-label="Send"
      />
    </form>

    <p v-if="allowFile" class="kitchen-ai-welcome__privacy">
      Selected files stay in your browser. Kitchen questions use the selected
      Live Kitchen only.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useKitchenConsole } from '../../../../composables/fireux/console/kitchen/core/useKitchenConsole'
import PromptInput from './PromptInput.vue'
import ToolNuggets from './ToolNuggets.vue'
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
  defineProps<KitchenAIPresentationOptions & {
    aiTools?: readonly KitchenAIToolNugget[]
  }>(),
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
const fileInput = ref<HTMLInputElement | null>(null)
const messages = ref<KitchenAIWelcomeMessage[]>([])
const submitting = ref(false)
const commandResult = ref<KitchenAIWelcomeMessage | null>(null)
const pendingTool = ref<{
  id: string
  name: string
  memberId?: string
  changes?: { memberId: string; name: string; previousName: string }[]
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
    const message = kitchenConsole.runtime.isDemo.value
      ? 'This Demo Kitchen is read-only. Select a Live Kitchen before running a command.'
      : 'Select or create a Live Kitchen before running a command.'
    if (commandMode.value) {
      commandResult.value = {
        id: ++messageId,
        role: 'assistant',
        text: message,
      }
    } else pushMessage('assistant', message)
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
        memberId?: string
        changes?: { memberId: string; name: string; previousName: string }[]
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
    const options = {
      createdObject: response.createdObject,
      resultAction: response.resultAction,
    }
    if (commandMode.value) {
      commandResult.value = {
        id: ++messageId,
        role: 'assistant',
        text: response.answer,
        ...options,
      }
    } else pushMessage('assistant', response.answer, options)
  } catch (error) {
    const failure = error as {
      data?: { statusMessage?: string; message?: string }
      message?: string
    }
    const message =
      failure.data?.statusMessage ||
      failure.data?.message ||
      failure.message ||
      'This command could not be prepared.'
    pendingTool.value = null
    if (commandMode.value) {
      commandResult.value = {
        id: ++messageId,
        role: 'assistant',
        text: message,
      }
    } else pushMessage('assistant', message)
  } finally {
    submitting.value = false
  }
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

function stageFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  pushMessage('user', `Use my menu: ${file.name}`)
  pushMessage(
    'assistant',
    `I can see ${file.name}. File analysis is not connected in this prototype, so the file has not left your browser.`
  )
  input.value = ''
}
</script>

<style scoped src="./welcome.css"></style>
