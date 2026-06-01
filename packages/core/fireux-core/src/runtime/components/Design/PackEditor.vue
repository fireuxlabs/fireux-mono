<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-dimmed">
          {{ description }}
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <UFormField label="Preset">
        <UFieldGroup size="sm">
          <UButton
            v-for="option in presetOptions"
            :key="option.value"
            color="neutral"
            :variant="draft.preset === option.value ? 'solid' : 'ghost'"
            :disabled="disabled || saving"
            @click="patchDraft({ preset: option.value })"
          >
            {{ option.label }}
          </UButton>
        </UFieldGroup>
      </UFormField>

      <UFormField label="Font">
        <UFieldGroup size="sm">
          <UButton
            v-for="option in fontOptions"
            :key="option.value"
            color="neutral"
            :variant="draft.style.font === option.value ? 'solid' : 'ghost'"
            :disabled="disabled || saving"
            @click="patchStyle({ font: option.value, heading_font: option.value })"
          >
            {{ option.label }}
          </UButton>
        </UFieldGroup>
      </UFormField>

      <UFormField label="Mode">
        <UFieldGroup size="sm">
          <UButton
            v-for="option in modeOptions"
            :key="option.value"
            color="neutral"
            :variant="draft.color_mode === option.value ? 'solid' : 'ghost'"
            :disabled="disabled || saving"
            @click="patchDraft({ color_mode: option.value })"
          >
            {{ option.label }}
          </UButton>
        </UFieldGroup>
      </UFormField>

      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-save"
          :loading="saving"
          :disabled="disabled || saving"
          @click="$emit('save', draft)"
        >
          Save design
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { FireuxDesignColorMode } from '../../composables/fireux/app/design/useFireuxDesignPack'

type FireuxDesignPackEditorValue = {
  preset?: string
  color_mode?: FireuxDesignColorMode
  style?: Record<string, string>
}

const props = withDefaults(defineProps<{
  modelValue?: FireuxDesignPackEditorValue | null
  title?: string
  description?: string
  disabled?: boolean
  saving?: boolean
}>(), {
  modelValue: null,
  title: 'Design',
  description: '',
  disabled: false,
  saving: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: FireuxDesignPackEditorValue]
  save: [value: FireuxDesignPackEditorValue]
}>()

const presetOptions = [
  { label: 'Classic', value: 'classic' },
  { label: 'Clean', value: 'clean' },
  { label: 'Dark', value: 'dark' },
  { label: 'Dark gold', value: 'dark_gold' },
]
const fontOptions = [
  { label: 'Serif', value: 'serif' },
  { label: 'Sans', value: 'sans' },
]
const modeOptions: Array<{ label: string, value: FireuxDesignColorMode }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const draft = reactive<Required<FireuxDesignPackEditorValue>>({
  preset: 'classic',
  color_mode: 'light',
  style: {
    font: 'serif',
    heading_font: 'serif',
  },
})

const normalizeValue = (value: FireuxDesignPackEditorValue | null | undefined) => ({
  preset: String(value?.preset || 'classic'),
  color_mode: value?.color_mode === 'dark' ? 'dark' : 'light',
  style: {
    font: value?.style?.font === 'sans' ? 'sans' : 'serif',
    heading_font: value?.style?.heading_font === 'sans' ? 'sans' : 'serif',
  },
})

watch(
  () => props.modelValue,
  (next) => {
    Object.assign(draft, normalizeValue(next))
  },
  { immediate: true }
)

function emitDraft() {
  emit('update:modelValue', {
    preset: draft.preset,
    color_mode: draft.color_mode,
    style: { ...draft.style },
  })
}

function patchDraft(patch: Partial<FireuxDesignPackEditorValue>) {
  Object.assign(draft, patch)
  emitDraft()
}

function patchStyle(patch: Record<string, string>) {
  draft.style = {
    ...draft.style,
    ...patch,
  }
  emitDraft()
}
</script>
