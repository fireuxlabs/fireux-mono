<template>
  <div class="base-form-field-top">
    <div class="top-row">
      <label class="field-label">{{ label }}</label>
      <div class="component-icons">
        <UIcon
          v-if="!isEditing"
          name="lucide:pencil"
          class="cursor-pointer"
          @click="$emit('start-editing')"
        />
        <template v-else>
          <UIcon
            name="lucide:check-circle"
            class="cursor-pointer"
            @click="$emit('check')"
          />
          <UIcon
            name="lucide:minus-circle"
            class="cursor-pointer"
            @click="$emit('cancel')"
          />
          <UIcon
            v-if="hasData"
            name="lucide:x-circle"
            class="cursor-pointer"
            @click="$emit('delete')"
          />
        </template>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: "" },
  isEditing: { type: Boolean, default: false },
  hasData: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" }
})

defineEmits(['start-editing', 'check', 'cancel', 'delete'])
</script>

<style lang="scss">
.base-form-field-top {
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .field-label {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .component-icons {
    display: flex;
    gap: 0.5rem;
  }

  .error-message {
    margin-top: var(--space-1);
    font-size: 0.875rem;
    color: var(--ui-error);
  }
}
</style>