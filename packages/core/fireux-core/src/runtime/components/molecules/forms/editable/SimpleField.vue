<!-- FILE: packages/core/fireux-core/src/runtime/components/molecules/forms/editable/SimpleField.vue -->
<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: localize the single display-field type recipe. -->
<template>
  <div class="flex w-full flex-col">
    <MoleculesFormsTop
      :label="label"
      :input-id="inputId"
      :is-editing="isEditing"
      :has-data="Boolean(effectiveValue.trim())"
      :error-message="errorMessage"
      :disabled="disabled"
      :disabled-message="disabledMessage"
      @start-editing="startEditing"
      @check="save"
      @cancel="cancel"
      @delete="clear"
    />

    <div v-if="!isEditing" class="flex">
      <div
        class="w-full rounded-md fx-field-surface px-3 text-sm leading-normal"
        :class="disabled ? 'text-muted' : 'text-dimmed'"
      >
        <span class="break-words">{{ displayValue }}</span>
      </div>
    </div>

    <div v-else>
      <UTextarea
        v-if="isTextarea"
        v-model="draft"
        :id="inputId"
        :placeholder="placeholder || ''"
        :maxlength="maxlength || 500"
        :rows="rows"
        resize="vertical"
        :disabled="saving"
        @keydown.enter="saveOnEnter"
        @keydown.esc.prevent="cancel"
      />
      <UInput
        v-else
        v-model="draft"
        :id="inputId"
        :placeholder="placeholder || ''"
        :type="inputType"
        :maxlength="maxlength || 500"
        :disabled="saving"
        @keydown.enter.prevent="save"
        @keydown.esc.prevent="cancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useUserSession } from '../../../../user/composables/session/useUserSession'

import {
  useEditableStringField,
  type FormattingFn,
  type UpdateFn,
  type ValidationFn,
} from '../../../../composables/forms/useEditableStringField'

const props = withDefaults(
  defineProps<{
    label?: string
    value?: string | number | null
    placeholder?: string
    update: UpdateFn
    captureIntent?: () => () => boolean
    type?: string
    maxlength?: number
    validationFunction?: ValidationFn
    formattingFunction?: FormattingFn
    rows?: number
    id?: string
    disabled?: boolean
    disabledMessage?: string
  }>(),
  {
    label: '',
    value: '',
    placeholder: '',
    type: 'text',
    maxlength: 500,
    validationFunction: null,
    formattingFunction: null,
    rows: 4,
    id: undefined,
    disabled: false,
    disabledMessage: '',
  }
)

const { currentUser } = useAuth()
const config = useFireUXConfig()
const { appUser } = useUserSession()

const emit = defineEmits<{ updated: [value: string] }>()

const {
  isEditing,
  draft,
  saving,
  errorMessage,
  disabled,
  disabledMessage,
  isTextarea,
  inputId,
  inputType,
  effectiveValue,
  displayValue,
  startEditing,
  cancel,
  clear,
  save,
  saveOnEnter,
} = useEditableStringField({
  label: () => props.label,
  value: () => props.value,
  placeholder: () => props.placeholder,
  type: () => props.type,
  maxlength: () => props.maxlength,
  rows: () => props.rows,
  id: () => props.id,
  disabled: () => props.disabled,
  disabledMessage: () => props.disabledMessage,
  validationFunction: () => props.validationFunction,
  formattingFunction: () => props.formattingFunction,
  captureIntent: () => props.captureIntent?.() ?? (() => true),
  sources: [
    () => currentUser.value?.uid,
    () => config.appId,
    () => appUser.value,
    () => props.update,
  ],
  update: (value, isCurrent) => props.update(value, isCurrent),
  emitUpdated: (value: string) => emit('updated', value),
})

const label = computed(() => props.label)
const placeholder = computed(() => props.placeholder)
const maxlength = computed(() => props.maxlength)
const rows = computed(() => props.rows)
</script>
