<template>
  <div class="contents">
    <div
      v-if="starters.length"
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
        @click="emit('update:modelValue', starter.prompt)"
      />
    </div>

    <ToolNuggets
      v-if="aiTools.length"
      :tools="aiTools"
      @select="emit('update:modelValue', $event)"
    />

    <form class="kitchen-ai-welcome__composer" @submit.prevent="emit('submit')">
      <input
        v-if="allowFile"
        ref="fileInput"
        class="sr-only"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
        @change="selectFile"
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
        :model-value="modelValue"
        class="kitchen-ai-welcome__input"
        :placeholder="placeholder"
        :suggestions="suggestions"
        :aria-label="ariaLabel"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <UButton
        v-if="voice.supported.value"
        type="button"
        :icon="voice.recording.value ? 'i-lucide-square' : 'i-lucide-mic'"
        :color="voice.recording.value ? 'error' : 'neutral'"
        :variant="voice.recording.value ? 'soft' : 'ghost'"
        :loading="transcribing"
        :disabled="submitting || transcribing"
        :aria-label="
          voice.recording.value ? 'Stop recording' : 'Speak to Kitchen AI'
        "
        @click="toggleVoice"
      />
      <UButton
        type="submit"
        icon="i-lucide-arrow-up"
        color="primary"
        :loading="submitting"
        :disabled="!modelValue.trim() || submitting"
        aria-label="Send"
      />
    </form>

    <p
      v-if="allowFile || voice.supported.value || transcribing || voiceError"
      class="kitchen-ai-welcome__privacy"
      aria-live="polite"
    >
      <template v-if="voice.recording.value"
        >Listening… tap stop when finished.</template
      >
      <template v-else-if="transcribing">Transcribing your voice…</template>
      <template v-else-if="voiceError">{{ voiceError }}</template>
      <template v-else>
        Voice clips are sent for transcription and are not stored by Misebox.
        Selected files stay in your browser. Kitchen questions use the current
        Kitchen only.
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useVoiceRecorder } from 'fireux-ai/runtime/composables/useVoiceRecorder'
import PromptInput from './PromptInput.vue'
import ToolNuggets from './ToolNuggets.vue'
import type { KitchenAIStarter, KitchenAIToolNugget } from './types'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    suggestions?: readonly string[]
    starters?: readonly KitchenAIStarter[]
    aiTools?: readonly KitchenAIToolNugget[]
    allowFile?: boolean
    commandMode?: boolean
    ariaLabel?: string
    submitting?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask Kitchen AI…',
    suggestions: () => [],
    starters: () => [],
    aiTools: () => [],
    allowFile: true,
    commandMode: false,
    ariaLabel: 'Ask KitchenAI',
    submitting: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  file: [file: File]
}>()
const fileInput = ref<HTMLInputElement | null>(null)
const voice = useVoiceRecorder()
const transcribing = ref(false)
const transcriptionError = ref('')
const voiceError = computed(() => transcriptionError.value || voice.error.value)
let recordingTimeout: ReturnType<typeof setTimeout> | null = null

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('file', file)
  input.value = ''
}

async function toggleVoice() {
  transcriptionError.value = ''
  if (!voice.recording.value) {
    if (await voice.start()) {
      recordingTimeout = setTimeout(() => void finishVoice(), 30_000)
    }
    return
  }
  await finishVoice()
}

async function finishVoice() {
  if (recordingTimeout) clearTimeout(recordingTimeout)
  recordingTimeout = null
  const recording = await voice.stop()
  if (!recording) return
  transcribing.value = true
  try {
    const user = await useRequireUser()
    const form = new FormData()
    form.append('file', recording.audio, recording.fileName)
    const result = await $fetch<{ ok: true; text: string }>(
      '/api/workspace/kitchen/agent/transcribe',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: form,
      }
    )
    emit('update:modelValue', result.text)
  } catch (cause) {
    const failure = cause as {
      data?: { statusMessage?: string; message?: string }
      message?: string
    }
    transcriptionError.value =
      failure.data?.statusMessage ||
      failure.data?.message ||
      failure.message ||
      'Your voice could not be transcribed.'
  } finally {
    transcribing.value = false
  }
}

onBeforeUnmount(() => {
  if (recordingTimeout) clearTimeout(recordingTimeout)
})
</script>
