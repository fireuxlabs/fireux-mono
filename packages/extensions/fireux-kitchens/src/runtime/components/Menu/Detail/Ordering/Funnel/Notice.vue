<template>
  <aside class="order-notice">
    <div class="order-notice__body">
      <div class="order-notice__icon" aria-hidden="true">
        <UIcon name="i-lucide-shield-alert" />
      </div>

      <div class="order-notice__copy">
        <p class="order-notice__eyebrow">
          {{ stepLabel }} · Before we send it
        </p>
        <h3>Food allergy or intolerance?</h3>
        <p>{{ message }}</p>
      </div>
    </div>

    <div class="order-notice__actions">
      <button
        v-if="backLabel"
        type="button"
        class="order-notice__action order-notice__action--back"
        @click="$emit('back')"
      >
        {{ backLabel }}
      </button>

      <button
        v-if="actionLabel"
        type="button"
        class="order-notice__action"
        @click="$emit('confirm')"
      >
        {{ actionLabel }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    stepLabel: string
    actionLabel?: string
    backLabel?: string
  }>(),
  {
    actionLabel: '',
    backLabel: '',
  }
)

defineEmits<{
  (event: 'back'): void
  (event: 'confirm'): void
}>()
</script>
