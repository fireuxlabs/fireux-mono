<template>
  <UPageCard
    title="Start a new Kitchen"
    description="Create a new Kitchen shell that is owned by this User. You can add its real Place details later."
    variant="subtle"
  >
    <form class="form-stack-sm" @submit.prevent="submit">
      <UFormField label="Kitchen name" required>
        <UInput
          v-model="name"
          placeholder="Kitchen name"
          :disabled="pending"
          autocomplete="organization"
        />
      </UFormField>
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        title="Unable to create Kitchen"
        :description="error"
      />
      <UButton
        type="submit"
        icon="i-lucide-plus"
        :loading="pending"
        :disabled="!name.trim()"
      >
        Create new Kitchen shell
      </UButton>
    </form>
  </UPageCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenCreate } from '../../composables/firestore/mutations/useKitchenCreate'
import type { KitchenShellCreateResult } from '../../models/kitchen-onboarding.model.ts'

const props = withDefaults(
  defineProps<{ ownerUserId?: string }>(),
  { ownerUserId: '' }
)
const emit = defineEmits<{
  (event: 'created', result: KitchenShellCreateResult): void
}>()
const { createKitchenShell } = useKitchenCreate()
const name = ref('')
const pending = ref(false)
const error = ref('')

async function submit() {
  const kitchenName = name.value.trim()
  if (!kitchenName || pending.value) return
  pending.value = true
  error.value = ''
  try {
    const result = await createKitchenShell({
      intent: 'create_shell',
      name: kitchenName,
      ...(props.ownerUserId ? { owner_user_id: props.ownerUserId } : {}),
    })
    emit('created', result)
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Kitchen creation failed.'
  } finally {
    pending.value = false
  }
}
</script>
