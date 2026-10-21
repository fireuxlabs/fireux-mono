<!-- Concurrent edit — 2026-07-21 15:50 CEST — User Profile polish: associate editable fields and name every field action for assistive tech. -->
<template>
  <div class="base-form-field-top">
    <div class="top-row">
      <div class="left">
        <label :for="inputId || undefined" class="field-label">{{ label }}</label>
        <UBadge
          v-if="disabled"
          size="xs"
          color="neutral"
          variant="soft"
          label="Locked"
          class="ml-2 shrink-0"
        />
        <span v-if="isEditing" class="editing-indicator">
          <span class="dot"></span>
          Editing
        </span>
      </div>

      <div class="actions">
        <template v-if="!isEditing">
          <UButton
            v-if="disabled"
            :aria-label="`Editing disabled for ${fieldName}`"
            color="neutral"
            variant="ghost"
            size="xs"
            :icon="'i-lucide-lock'"
            disabled
          />
          <UTooltip v-else :text="`Edit ${fieldName}`" :popper="{ placement: 'top' }">
            <UButton
              :aria-label="`Edit ${fieldName}`"
              color="primary"
              variant="ghost"
              size="xs"
              :icon="'i-lucide-pencil'"
              @click="$emit('start-editing')"
            />
          </UTooltip>
        </template>
        <template v-else>
          <UTooltip :text="`Save ${fieldName}`" :popper="{ placement: 'top' }">
            <UButton
              :aria-label="`Save ${fieldName}`"
              color="success"
              variant="soft"
              size="xs"
              :icon="'i-lucide-check'"
              @click="$emit('check')"
            />
          </UTooltip>
          <UTooltip :text="`Cancel editing ${fieldName}`" :popper="{ placement: 'top' }">
            <UButton
              :aria-label="`Cancel editing ${fieldName}`"
              color="neutral"
              variant="ghost"
              size="xs"
              :icon="'i-lucide-undo-2'"
              @click="$emit('cancel')"
            />
          </UTooltip>
          <UTooltip v-if="hasData" :text="`Clear ${fieldName}`" :popper="{ placement: 'top' }">
            <UButton
              :aria-label="`Clear ${fieldName}`"
              color="error"
              variant="ghost"
              size="xs"
              :icon="'i-lucide-trash-2'"
              @click="$emit('delete')"
            />
          </UTooltip>
        </template>
      </div>
    </div>

    <div v-if="disabled && disabledMessage" class="disabled-wrap">
      <p class="disabled-message">{{ disabledMessage }}</p>
    </div>

    <div v-if="errorMessage" class="error-wrap" aria-live="polite">
      <UAlert
        :title="errorMessage"
        color="error"
        variant="soft"
        :icon="'i-lucide-alert-triangle'"
      >
        <template #actions><MoleculesCopyError :message="errorMessage" /></template>
      </UAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  inputId: { type: String, default: '' },
  isEditing: { type: Boolean, default: false },
  hasData: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  disabledMessage: { type: String, default: '' },
})

defineEmits(['start-editing', 'check', 'cancel', 'delete'])

const fieldName = computed(() => props.label.trim() || 'field')
</script>

<style scoped>
.base-form-field-top {
  padding-top: var(--spacing);
  padding-bottom: var(--spacing);
}
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
}
.left {
  display: flex;
  align-items: center;
  min-width: 0;
}
.field-label {
  font-size: var(--text-sm); /* text-sm */
  font-weight: var(--font-weight-semibold); /* semibold */
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing);
}
.editing-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing);
  margin-left: calc(var(--spacing) * 2);
  font-size: var(--text-xs); /* text-xs */
  color: var(--ui-primary);
}
.editing-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--ui-primary);
}
.error-wrap {
  margin-top: var(--spacing);
}
.disabled-wrap {
  margin-top: var(--spacing);
}
.disabled-message {
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}
</style>
