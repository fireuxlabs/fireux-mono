<template>
  <aside class="order-notice">
    <div class="order-notice__body">
      <div class="order-notice__icon" aria-hidden="true">
        <UIcon name="i-lucide-shield-alert" />
      </div>

      <div class="order-notice__copy">
        <p class="order-notice__eyebrow">
          Before we send it
        </p>
        <h3>Food allergy or intolerance?</h3>
        <p>{{ message }}</p>
      </div>
    </div>

    <button
      v-if="actionLabel"
      type="button"
      class="order-notice__action"
      @click="$emit('confirm')"
    >
      {{ actionLabel }}
    </button>
  </aside>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    actionLabel?: string
  }>(),
  {
    actionLabel: '',
  }
)

defineEmits<{
  (event: 'confirm'): void
}>()
</script>
