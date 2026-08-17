<template>
  <section class="kitchen-ai-welcome" aria-labelledby="kitchen-ai-title">
    <div class="kitchen-ai-welcome__intro">
      <div class="kitchen-ai-welcome__mark" aria-hidden="true">
        <UIcon name="i-lucide-sparkles" />
      </div>
      <p class="fx-type-label">Kitchen AI powered by {{ appName }}</p>
      <h1 id="kitchen-ai-title" class="fx-type-display-title">
        How can I help your kitchen today?
      </h1>
      <p class="fx-type-description text-toned">
        Give me your existing menu and I’ll help turn it into a working digital
        Menu and Kitchen Console.
      </p>
    </div>

    <div
      v-if="messages.length"
      class="kitchen-ai-welcome__messages"
      aria-live="polite"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="kitchen-ai-welcome__message"
        :class="`kitchen-ai-welcome__message--${message.role}`"
      >
        {{ message.text }}
      </div>
    </div>

    <div
      class="kitchen-ai-welcome__starters"
      aria-label="Suggested starting points"
    >
      <UButton
        v-for="starter in starters"
        :key="starter.label"
        :label="starter.label"
        :icon="starter.icon"
        color="neutral"
        variant="soft"
        @click="prompt = starter.prompt"
      />
    </div>

    <form class="kitchen-ai-welcome__composer" @submit.prevent="sendPrompt">
      <input
        ref="fileInput"
        class="sr-only"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
        @change="stageFile"
      />
      <UButton
        icon="i-lucide-paperclip"
        color="neutral"
        variant="ghost"
        aria-label="Upload your existing menu"
        @click="fileInput?.click()"
      />
      <UInput
        v-model="prompt"
        class="kitchen-ai-welcome__input"
        size="xl"
        variant="none"
        placeholder="Ask Kitchen AI…"
        aria-label="Ask Kitchen AI"
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

    <p class="kitchen-ai-welcome__privacy">
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

type KitchenAIWelcomeMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const { appName } = useFireUXConfig()
const kitchenConsole = useKitchenConsole()
const prompt = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const messages = ref<KitchenAIWelcomeMessage[]>([])
const submitting = ref(false)
let messageId = 0

const selectedLiveScope = computed(() => ({
  appId: String(kitchenConsole.runtime.appId.value || '').trim(),
  kitchenId: String(kitchenConsole.runtime.storageKitchenId.value || '').trim(),
}))

const starters = [
  {
    label: 'Upload my menu',
    prompt: 'I have an existing menu I want to turn into a working Kitchen.',
    icon: 'i-lucide-file-up',
  },
  {
    label: 'Try a Demo Kitchen',
    prompt: 'Show me an example Kitchen so I can explore the Console.',
    icon: 'i-lucide-chef-hat',
  },
  {
    label: 'Start from scratch',
    prompt: 'Help me create a new Kitchen from scratch.',
    icon: 'i-lucide-plus',
  },
] as const

function pushMessage(role: KitchenAIWelcomeMessage['role'], text: string) {
  messages.value.push({ id: ++messageId, role, text })
}

async function sendPrompt() {
  const text = prompt.value.trim()
  if (!text || submitting.value) return
  pushMessage('user', text)
  prompt.value = ''

  const { appId, kitchenId } = selectedLiveScope.value
  if (!appId || !kitchenId) {
    pushMessage(
      'assistant',
      kitchenConsole.runtime.isDemo.value
        ? 'This Demo Kitchen is read-only. Select a Live Kitchen before asking Kitchen AI.'
        : 'Select or create a Live Kitchen before asking Kitchen AI.'
    )
    return
  }

  submitting.value = true
  try {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const response = await $fetch<{ ok: true; answer: string }>(
      '/api/console/kitchen/agent',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { appId, kitchenId, prompt: text },
      }
    )
    pushMessage('assistant', response.answer)
  } catch (error) {
    const failure = error as {
      data?: { statusMessage?: string; message?: string }
      message?: string
    }
    pushMessage(
      'assistant',
      failure.data?.statusMessage ||
        failure.data?.message ||
        failure.message ||
        'Kitchen AI could not answer this Kitchen question.'
    )
  } finally {
    submitting.value = false
  }
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
