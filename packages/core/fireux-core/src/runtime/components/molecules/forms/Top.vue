<template>
  <div class="base-form-field-top">
    <div class="top-row">
      <div class="left">
        <span class="field-label">{{ label }}</span>
        <span v-if="isEditing" class="editing-indicator">
          <span class="dot"></span>
          Editing
        </span>
      </div>

      <div class="actions">
        <template v-if="!isEditing">
          <UTooltip text="Edit" :popper="{ placement: 'top' }">
            <UButton
              aria-label="Edit"
              color="primary"
              variant="ghost"
              size="xs"
              :icon="'i-lucide-pencil'"
              @click="$emit('start-editing')"
            />
          </UTooltip>
        </template>
        <template v-else>
          <UTooltip text="Save" :popper="{ placement: 'top' }">
            <UButton
              aria-label="Save"
              color="success"
              variant="soft"
              size="xs"
              :icon="'i-lucide-check'"
              @click="$emit('check')"
            />
          </UTooltip>
          <UTooltip text="Cancel" :popper="{ placement: 'top' }">
            <UButton
              aria-label="Cancel"
              color="neutral"
              variant="ghost"
              size="xs"
              :icon="'i-lucide-undo-2'"
              @click="$emit('cancel')"
            />
          </UTooltip>
          <UTooltip v-if="hasData" text="Clear" :popper="{ placement: 'top' }">
            <UButton
              aria-label="Clear"
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

    <div v-if="errorMessage" class="error-wrap" aria-live="polite">
      <UAlert
        :title="errorMessage"
        color="error"
        variant="soft"
        :icon="'i-lucide-alert-triangle'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: { type: String, default: '' },
  isEditing: { type: Boolean, default: false },
  hasData: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

defineEmits(['start-editing', 'check', 'cancel', 'delete'])
</script>

<style scoped>
.base-form-field-top {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.left {
  display: flex;
  align-items: center;
  min-width: 0;
}
.field-label {
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* semibold */
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.editing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  font-size: 0.75rem; /* text-xs */
  color: var(--ui-color-primary, #2563eb);
}
.editing-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--ui-color-primary, #2563eb);
}
.error-wrap {
  margin-top: 0.25rem;
}
</style>
