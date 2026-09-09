<template>
  <WorkspaceAI aria-label="Kitchen Identity AI" compact>
    <p v-if="message" role="status" class="text-sm text-muted">{{ message }}</p>
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="
        Boolean(
          prompt.trim() && !submitting && identity.availableActions.value.length
        )
      "
      :submitting="submitting"
      placeholder="Ask Kitchen Identity AI…"
      aria-label="Ask Kitchen Identity AI"
      :suggestions="suggestions"
      @submit="submit"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
const props = defineProps<{
  identity: ReturnType<typeof useKitchenIdentity>
}>()
const emit = defineEmits<{ action: [intent: KitchenIdentityIntent] }>()
const prompt = ref(''),
  message = ref(''),
  submitting = ref(false)
let active = true
onBeforeUnmount(() => {
  active = false
})
const suggestions = computed(() =>
  props.identity.canWrite.value
    ? [
        { label: 'Help me edit the venue identity' },
        { label: 'Change the tagline to Fresh pizza, made with care' },
      ]
    : []
)
async function submit() {
  if (
    submitting.value ||
    !prompt.value.trim() ||
    !props.identity.availableActions.value.length
  )
    return
  const scope = props.identity.scopeKey.value
  submitting.value = true
  message.value = ''
  try {
    const user = await useRequireUser()
    const intent = await $fetch<KitchenIdentityIntent>(
      '/api/workspace/kitchen/identity/intent',
      {
        method: 'POST',
        timeout: 60000,
        retry: 0,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          prompt: prompt.value.trim(),
          identity: props.identity.fields.value,
          availableActions: props.identity.availableActions.value,
        },
      }
    )
    if (!active) return
    if (scope !== props.identity.scopeKey.value) {
      message.value =
        'The selected venue or its details changed. Send your request again.'
      return
    }
    if (
      intent.action !== 'none' &&
      !props.identity.availableActions.value.includes(intent.action)
    ) {
      message.value = 'That action is no longer available.'
      return
    }
    message.value =
      intent.action === 'update'
        ? 'Review the prepared editor. Nothing has been saved yet.'
        : intent.message
    if (intent.action === 'update') emit('action', intent)
  } catch (cause) {
    message.value =
      cause instanceof Error
        ? cause.message
        : 'Identity AI could not prepare that action.'
  } finally {
    submitting.value = false
  }
}
</script>
