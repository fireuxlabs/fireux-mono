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

    <input
      v-if="allowFile"
      ref="fileInput"
      class="sr-only"
      type="file"
      accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
      @change="selectFile"
    />

    <UChatPrompt
      :model-value="modelValue"
      :placeholder="placeholder"
      :loading="submitting"
      :aria-label="ariaLabel"
      @update:model-value="emit('update:modelValue', $event)"
      @submit.prevent="emit('submit')"
    >
      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-1">
            <UButton
              v-if="allowFile"
              type="button"
              icon="i-lucide-paperclip"
              color="neutral"
              variant="ghost"
              aria-label="Upload your existing menu"
              @click="fileInput?.click()"
            />
            <UButton
              v-if="mounted && voice.supported.value"
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
          </div>
          <UChatPromptSubmit
            :status="submitting ? 'submitted' : 'ready'"
            label="Send"
          />
        </div>
      </template>
    </UChatPrompt>

    <div
      v-if="contextualActions.length"
      class="flex flex-wrap gap-2"
      aria-label="Suggested Kitchen actions"
    >
      <UButton
        v-for="action in contextualActions"
        :key="action"
        :label="action"
        color="neutral"
        variant="outline"
        size="sm"
        class="rounded-full"
        @click="emit('update:modelValue', action)"
      />
    </div>

    <p
      v-if="voice.recording.value || transcribing || voiceError"
      class="kitchen-ai-welcome__privacy"
      aria-live="polite"
    >
      <template v-if="voice.recording.value"
        >Listening… tap stop when finished.</template
      >
      <template v-else-if="transcribing">Transcribing your voice…</template>
      <template v-else-if="voiceError">{{ voiceError }}</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useVoiceRecorder } from 'fireux-ai/runtime/composables/useVoiceRecorder'
import ToolNuggets from './ToolNuggets.vue'
import type { KitchenAIStarter, KitchenAIToolNugget } from './types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    suggestions?: readonly string[]
    starters?: readonly KitchenAIStarter[]
    aiTools?: readonly KitchenAIToolNugget[]
    allowFile?: boolean
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
const mounted = ref(false)
const voice = useVoiceRecorder()
const transcribing = ref(false)
const transcriptionError = ref('')
const voiceError = computed(() => transcriptionError.value || voice.error.value)
const contextualActions = computed(() => props.suggestions.slice(0, 4))
let recordingTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  mounted.value = true
})

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

<style src="./welcome.css"></style>
