<template>
  <div class="menu-order-panel__actions">
    <button
      type="button"
      class="menu-order-panel__back"
      @click="$emit('back')"
    >
      {{ backLabel }}
    </button>

    <button
      :type="submit ? 'submit' : 'button'"
      class="menu-order-panel__submit"
      :disabled="disabled || pending"
      @click="handleAction"
    >
      <span
        v-if="pending"
        class="menu-order-panel__spinner"
        aria-hidden="true"
      />
      {{ pending ? pendingLabel : actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    actionLabel: string
    backLabel?: string
    disabled?: boolean
    pending?: boolean
    pendingLabel?: string
    submit?: boolean
  }>(),
  {
    backLabel: 'Back',
    disabled: false,
    pending: false,
    pendingLabel: 'Working...',
    submit: false,
  }
)

const emit = defineEmits<{
  (event: 'action'): void
  (event: 'back'): void
}>()

function handleAction() {
  if (props.submit) return
  emit('action')
}
</script>
