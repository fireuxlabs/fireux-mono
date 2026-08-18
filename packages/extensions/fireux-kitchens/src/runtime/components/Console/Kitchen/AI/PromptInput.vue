<template>
  <div class="kitchen-ai-prompt-input">
    <input
      :value="modelValue"
      class="kitchen-ai-prompt-input__control"
      :aria-label="ariaLabel"
      autocomplete="off"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="updateValue"
    />
    <span
      v-if="!modelValue && visibleHint"
      class="kitchen-ai-prompt-input__hint"
      aria-hidden="true"
    >
      {{ visibleHint
      }}<span v-if="typing" class="kitchen-ai-prompt-input__caret" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    suggestions?: readonly string[]
    ariaLabel?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask Kitchen AI…',
    suggestions: () => [],
    ariaLabel: 'Ask Kitchen AI',
  }
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const hint = ref('')
const suggestionIndex = ref(0)
const focused = ref(false)
const reducedMotion = ref(false)
const typing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const examples = computed(() =>
  props.suggestions.length ? props.suggestions : [props.placeholder]
)
const visibleHint = computed(() =>
  hint.value || props.suggestions.length ? hint.value : props.placeholder
)

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function schedule(callback: () => void, delay: number) {
  clearTimer()
  timer = setTimeout(callback, delay)
}

function typeSuggestion() {
  if (focused.value || props.modelValue || reducedMotion.value) return
  const suggestion = examples.value[suggestionIndex.value] || props.placeholder
  typing.value = true
  if (hint.value.length < suggestion.length) {
    hint.value = suggestion.slice(0, hint.value.length + 1)
    schedule(typeSuggestion, 42)
    return
  }
  typing.value = false
  schedule(deleteSuggestion, 2400)
}

function deleteSuggestion() {
  if (focused.value || props.modelValue || reducedMotion.value) return
  typing.value = true
  if (hint.value.length) {
    hint.value = hint.value.slice(0, -1)
    schedule(deleteSuggestion, 24)
    return
  }
  suggestionIndex.value = (suggestionIndex.value + 1) % examples.value.length
  schedule(typeSuggestion, 350)
}

function start() {
  clearTimer()
  if (reducedMotion.value) {
    hint.value = examples.value[0] || props.placeholder
    typing.value = false
    return
  }
  hint.value = ''
  schedule(typeSuggestion, 350)
}

function handleFocus() {
  focused.value = true
  typing.value = false
  clearTimer()
}

function handleBlur() {
  focused.value = false
  if (!props.modelValue) start()
}

function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  start()
})
onBeforeUnmount(clearTimer)
</script>

<style scoped>
.kitchen-ai-prompt-input__control {
  width: 100%;
  min-width: 0;
  height: calc(var(--spacing) * 10);
  padding-inline: calc(var(--spacing) * 3);
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ui-text-highlighted);
  font: inherit;
}

.kitchen-ai-prompt-input__hint {
  position: absolute;
  top: 50%;
  left: calc(var(--spacing) * 3);
  overflow: hidden;
  max-width: calc(100% - calc(var(--spacing) * 6));
  transform: translateY(-50%);
  color: var(--ui-text-dimmed);
  font-size: var(--text-base);
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kitchen-ai-prompt-input__caret {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin-left: 1px;
  animation: kitchen-ai-caret 800ms step-end infinite;
  background: currentColor;
  vertical-align: -0.1em;
}

@keyframes kitchen-ai-caret {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kitchen-ai-prompt-input__caret {
    display: none;
    animation: none;
  }
}
</style>
