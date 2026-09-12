<template>
  <UPageCard
    title="Create without a listed location"
    description="Enter a kitchen name. You can add its address and branding later."
    variant="subtle"
  >
    <form class="form-stack-sm" @submit.prevent="submit">
      <UFormField label="Kitchen name" required>
        <UInput
          v-model="name"
          placeholder="Kitchen name"
          :disabled="pending || Boolean(createdResult)"
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
        {{ createdResult ? 'Open kitchen' : 'Add kitchen' }}
      </UButton>
    </form>
  </UPageCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenCreate } from '../../composables/firestore/useKitchenCreate'
import type {
  KitchenDirectoryContributionResult,
  KitchenShellCreateResult,
} from '../../models/kitchen-onboarding.model.ts'

const props = withDefaults(
  defineProps<{ ownerUserId?: string; directory?: boolean }>(),
  {
    ownerUserId: '',
    directory: false,
  }
)
const emit = defineEmits<{
  (event: 'created', result: KitchenShellCreateResult): void
  (event: 'contributed', result: KitchenDirectoryContributionResult): void
}>()
const { createKitchenShell, contributeKitchenDirectory } = useKitchenCreate()
const name = ref('')
const pending = ref(false)
const error = ref('')
const createdResult = ref<
  KitchenShellCreateResult | KitchenDirectoryContributionResult | null
>(null)

function deliver(
  result: KitchenShellCreateResult | KitchenDirectoryContributionResult
) {
  if ('owner_user_id' in result) emit('created', result)
  else emit('contributed', result)
}

async function submit() {
  if (createdResult.value) {
    deliver(createdResult.value)
    return
  }
  const kitchenName = name.value.trim()
  if (!kitchenName || pending.value) return
  pending.value = true
  error.value = ''
  try {
    const result = props.directory
      ? await contributeKitchenDirectory({ name: kitchenName })
      : await createKitchenShell({
          intent: 'create_shell',
          name: kitchenName,
          ...(props.ownerUserId ? { owner_user_id: props.ownerUserId } : {}),
        })
    createdResult.value = result
    deliver(result)
  } catch (cause) {
    const detail = cause as { data?: { statusMessage?: string } }
    error.value =
      detail?.data?.statusMessage ||
      (cause instanceof Error ? cause.message : 'Kitchen creation failed.')
  } finally {
    pending.value = false
  }
}
</script>
