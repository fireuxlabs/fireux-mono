<template>
  <section class="grid gap-2 rounded-lg border border-error/20 bg-error/5 p-3">
    <UButton
      v-if="!open"
      color="error"
      variant="soft"
      block
      :disabled="!orderId"
      @click="open = true"
    >
      Reject
    </UButton>

    <template v-else>
      <UTextarea
        v-model="note"
        :rows="3"
        placeholder="Tell the guest why this order cannot be accepted."
      />

      <div class="grid grid-cols-2 gap-2">
        <UButton
          color="neutral"
          variant="soft"
          block
          :disabled="rejecting"
          @click="cancel"
        >
          Cancel
        </UButton>

        <UButton
          color="error"
          block
          :disabled="!canReject"
          :loading="rejecting"
          @click="reject"
        >
          Send rejection
        </UButton>
      </div>
    </template>
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
    rejecting?: boolean
  }>(),
  {
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
  Boolean(props.orderId && cleanNote.value && !props.rejecting)
)

function cancel() {
  if (props.rejecting) return
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
