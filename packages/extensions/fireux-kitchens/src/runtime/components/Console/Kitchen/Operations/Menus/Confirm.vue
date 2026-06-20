<template>
  <div
    v-if="result"
    class="flex flex-wrap items-center gap-3"
  >
    <UButton
      v-if="!menu"
      :loading="pending"
      :disabled="!canConfirm"
      icon="i-lucide-check-circle-2"
      @click="confirmDraft"
    >
      Confirm draft and create menu
    </UButton>

    <p
      v-if="menu"
      class="text-sm text-dimmed"
    >
      This menu already exists. Updating existing menus needs a separate review
      flow.
    </p>

    <p
      v-if="message"
      class="text-sm text-success"
    >
      {{ message }}
    </p>

    <p
      v-if="error"
      class="text-sm text-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  menu?: unknown | null
  source?: unknown | null
  result?: Record<string, unknown> | null
  sections: Record<string, unknown>[]
  appId: string
  kitchenId: string
  menuId: string
  authToken: string
  blocked?: boolean
}>()

const emit = defineEmits<{
  confirmed: [payload: Record<string, unknown>]
}>()

const pending = ref(false)
const error = ref('')
const confirmResult = ref<Record<string, unknown> | null>(null)
const text = (value: unknown) => String(value ?? '').trim()
const canConfirm = computed(() =>
  Boolean(
    props.result &&
      !props.menu &&
      props.sections.length &&
      props.source &&
      text(props.appId) &&
      text(props.kitchenId) &&
      text(props.menuId) &&
      text(props.authToken) &&
      !props.blocked &&
      !pending.value
  )
)
const message = computed(() => text(confirmResult.value?.message))

async function confirmDraft() {
  error.value = ''
  confirmResult.value = null

  if (!canConfirm.value) {
    error.value = 'Process a source into a dish draft before confirming.'
    return
  }

  pending.value = true

  try {
    const response = await fetch('/api/console/kitchen/menus/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${props.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: props.appId,
        kitchenId: props.kitchenId,
        menuId: props.menuId,
        uploadId: props.menuId,
        sections: props.sections,
      }),
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        text(payload?.statusMessage) ||
          text(payload?.message) ||
          `Confirm failed with status ${response.status}.`
      )
    }

    confirmResult.value = payload as Record<string, unknown>
    emit('confirmed', confirmResult.value)
  } catch (cause) {
    error.value = cause instanceof Error
      ? cause.message
      : 'Menu confirmation failed.'
  } finally {
    pending.value = false
  }
}
</script>
