<template>
  <section class="receiving-reject">
    <UButton
      v-if="!open"
      color="neutral"
      variant="ghost"
      block
      size="sm"
      icon="i-lucide-x"
      label="Cannot accept this order"
      :disabled="!canInteract || !orderId"
      @click="open = true"
    />

    <div v-else class="receiving-reject__form">
      <header class="receiving-reject__header">
        <strong>Reject order</strong>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          aria-label="Close rejection form"
          :disabled="rejecting"
          @click="cancel"
        />
      </header>

      <UTextarea
        v-model="note"
        :rows="3"
        placeholder="Tell the guest why this order cannot be accepted."
        :disabled="!canInteract"
      />

      <div class="receiving-reject__actions">
        <UButton
          color="error"
          block
          icon="i-lucide-send"
          label="Send rejection"
          :disabled="!canReject"
          :loading="rejecting"
          @click="reject"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'

const props = withDefaults(
  defineProps<{
    orderId: string
    canInteract?: boolean
    rejecting?: boolean
  }>(),
  {
    canInteract: true,
    rejecting: false,
  }
)
const emit = defineEmits<{
  (event: 'reject', payload: { id: string; note: string }): void
}>()

const open = ref(false)
const note = ref('')
const cleanNote = computed(() => note.value.trim())
const canReject = computed(() =>
  Boolean(props.canInteract && props.orderId && cleanNote.value && !props.rejecting)
)

function cancel() {
  if (!props.canInteract || props.rejecting) return
  open.value = false
  note.value = ''
}

function reject() {
  if (!canReject.value) return
  emit('reject', {
    id: props.orderId,
    note: cleanNote.value,
  })
}
</script>

<style scoped>
.receiving-reject {
  border-top: 1px solid var(--ui-border-accented);
  margin-top: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 2);
}

.receiving-reject__form {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.receiving-reject__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.receiving-reject__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
