<template>
  <UChatPrompt
    :model-value="modelValue"
    :placeholder="animatedPlaceholder"
    :autofocus="false"
    @focusin="pauseHint"
    @focusout="resumeHint"
    :loading="submitting"
    variant="soft"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @update:model-value="emit('update:modelValue', $event)"
    @submit.prevent="emit('submit')"
  >
    <template #footer>
      <div class="flex w-full items-center justify-between gap-3">
        <div class="flex items-center gap-1">
          <slot name="leading">
            <UButton
              type="button"
              icon="i-lucide-mic"
              color="neutral"
              variant="ghost"
              :disabled="!canRecord"
              aria-label="Speak to Workspace AI"
              @click="emit('record')"
            />
            <UButton
              type="button"
              icon="i-lucide-paperclip"
              color="neutral"
              variant="ghost"
              :disabled="!canAttach"
              aria-label="Attach a file"
              @click="emit('attach')"
            />
          </slot>
        </div>
        <div class="flex items-center gap-1">
          <UButton
            to="https://fireux.app/gpt"
            target="_blank"
            :label="activeModel.label"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="About this FireUX AI model"
          >
            <template #leading>
              <img
                src="/img/core/brand/logo.svg"
                alt=""
                class="size-4 object-contain"
              />
            </template>
          </UButton>
          <slot name="submit">
            <UChatPromptSubmit
              :status="submitting ? 'submitted' : 'ready'"
              :disabled="!canSubmit"
              aria-label="Submit prompt"
            />
          </slot>
        </div>
      </div>
    </template>
  </UChatPrompt>

  <div
    v-if="suggestions.length"
    class="flex flex-wrap gap-2"
    :aria-label="suggestionsAriaLabel"
  >
    <UButton
      v-for="suggestion in suggestions"
      :key="suggestion.label"
      :label="suggestion.label"
      :icon="suggestion.icon"
      color="neutral"
      variant="outline"
      size="sm"
      class="rounded-full"
      :disabled="suggestionsDisabled"
      @click="emit('selectSuggestion', suggestion)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'

export interface WorkspaceAISuggestion {
  label: string
  icon?: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    ariaLabel?: string
    submitting?: boolean
    disabled?: boolean
    canSubmit?: boolean
    canAttach?: boolean
    canRecord?: boolean
    suggestions?: readonly WorkspaceAISuggestion[]
    suggestionsAriaLabel?: string
    suggestionsDisabled?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask about this Workspace…',
    ariaLabel: 'Ask Workspace AI',
    submitting: false,
    disabled: false,
    canSubmit: false,
    canAttach: false,
    canRecord: false,
    suggestions: () => [],
    suggestionsAriaLabel: 'Suggested Workspace AI actions',
    suggestionsDisabled: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  attach: []
  record: []
  selectSuggestion: [suggestion: WorkspaceAISuggestion]
}>()

// The hint is presentation only; it never changes the user's prompt.
const hint = ref('')
const focused = ref(false)
const reducedMotion = ref(false)
const mounted = ref(false)
const examples = computed(() =>
  [props.placeholder, ...props.suggestions.map((item) => item.label)].filter(
    Boolean
  )
)
const animatedPlaceholder = computed(() =>
  reducedMotion.value || focused.value || props.modelValue
    ? props.placeholder
    : hint.value || '\u00a0'
)
let hintTimer: ReturnType<typeof setTimeout> | undefined
let exampleIndex = 0
let deletingHint = false
let motionQuery: MediaQueryList | undefined
function stopHint() {
  if (hintTimer) clearTimeout(hintTimer)
  hintTimer = undefined
}
function tickHint() {
  if (
    !mounted.value ||
    focused.value ||
    props.modelValue ||
    reducedMotion.value
  )
    return
  const text = examples.value[exampleIndex] || props.placeholder
  if (deletingHint) {
    hint.value = hint.value.slice(0, -1)
    if (!hint.value) {
      deletingHint = false
      exampleIndex = (exampleIndex + 1) % Math.max(1, examples.value.length)
    }
  } else {
    hint.value = text.slice(0, hint.value.length + 1)
    if (hint.value === text) {
      deletingHint = true
      hintTimer = setTimeout(tickHint, 2400)
      return
    }
  }
  hintTimer = setTimeout(tickHint, deletingHint ? 24 : 42)
}
function restartHint() {
  stopHint()
  hint.value = ''
  exampleIndex = 0
  deletingHint = false
  if (mounted.value) hintTimer = setTimeout(tickHint, 350)
}
function pauseHint() {
  focused.value = true
  stopHint()
}
function resumeHint() {
  focused.value = false
  restartHint()
}
function motionChanged() {
  reducedMotion.value = Boolean(motionQuery?.matches)
  restartHint()
}
watch([examples, () => props.modelValue], restartHint)
onMounted(() => {
  mounted.value = true
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', motionChanged)
  motionChanged()
})
onBeforeUnmount(() => {
  stopHint()
  motionQuery?.removeEventListener('change', motionChanged)
})

const runtime = useRuntimeConfig() as {
  public?: {
    fireux?: {
      ai?: {
        mode?: string
        provider?: string
        model?: string
      }
    }
  }
}
const ai = computed(() => runtime.public?.fireux?.ai ?? {})
const activeModel = computed(() => {
  const mode = String(ai.value.mode || '').trim()
  const provider = String(ai.value.provider || '').trim()
  const model = String(ai.value.model || '').trim() || 'gpt-4o-mini'
  const value = mode === 'codex' ? 'codex-dev' : model
  const label =
    mode === 'codex'
      ? 'Codex · development override'
      : mode === 'simulator'
        ? 'FireUX AI · simulator'
        : `${provider === 'openai' ? 'OpenAI' : provider || 'FireUX AI'} · ${model}`
  return { value, label }
})
</script>
