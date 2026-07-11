<template>
  <footer class="flex flex-wrap items-center justify-end gap-3 border-t border-default pt-4">
    <span
      class="mr-auto text-sm text-muted"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ status }}
    </span>

    <UButton
      v-if="cancelTo"
      :to="cancelTo"
      color="neutral"
      variant="ghost"
      :disabled="loading"
    >
      {{ cancelLabel }}
    </UButton>

    <UButton
      type="submit"
      :icon="submitIcon"
      :loading="loading"
      :disabled="disabled || loading"
    >
      {{ submitLabel }}
    </UButton>
  </footer>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  submitLabel?: string
  submitIcon?: string
  cancelTo?: string
  cancelLabel?: string
  status?: string
  loading?: boolean
  disabled?: boolean
}>(), {
  submitLabel: 'Save',
  submitIcon: 'i-lucide-save',
  cancelTo: '',
  cancelLabel: 'Cancel',
  status: '',
  loading: false,
  disabled: false,
})
</script>
