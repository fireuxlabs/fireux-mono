<!-- FILE: packages/core/fireux-core/src/runtime/components/molecules/forms/Firestore/SimpleField.vue -->
<template>
  <div class="flex w-full flex-col gap-1.5">
    <MoleculesFormsTop
      :label="label"
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

    <div v-if="!isEditing" class="flex min-h-9 items-center">
      <div
        class="w-full rounded-md fx-field-surface px-3 py-2 text-sm"
        :class="disabled ? 'text-dimmed' : 'text-default'"
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
import {
  useEditableStringField,
  type FormattingFn,
  type UpdateFn,
  type ValidationFn,
} from '../../../../composables/fireux/app/forms/useEditableStringField'

const props = withDefaults(
  defineProps<{
    label?: string
    firebaseValue?: string | number | null
    placeholder?: string
    updateFunction: UpdateFn
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
    firebaseValue: '',
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
  label: props.label,
  firebaseValue: props.firebaseValue,
  placeholder: props.placeholder,
  type: props.type,
  maxlength: props.maxlength,
  rows: props.rows,
  id: props.id,
  disabled: props.disabled,
  disabledMessage: props.disabledMessage,
  validationFunction: props.validationFunction,
  formattingFunction: props.formattingFunction,
  updateFunction: props.updateFunction,
  emitUpdated: (value: string) => emit('updated', value),
})

const { label, placeholder, maxlength, rows } = props
</script>
