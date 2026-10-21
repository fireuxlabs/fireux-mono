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
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { KitchenIdentityIntent } from '../../models/identity-intent'
import type { useKitchenIdentity } from '../../composables/workspace/identity/useKitchenIdentity'
const props = defineProps<{
  identity: ReturnType<typeof useKitchenIdentity>
}>()
const emit = defineEmits<{ action: [intent: KitchenIdentityIntent] }>()
const prompt = ref(''),
  message = ref(''),
  submitting = ref(false)
const { currentUser } = useAuth()
const session = useAppSession()
const config = useFireUXConfig()
const route = useRoute()
const sources = [
  () => currentUser.value?.uid,
  session.appUser,
  session.pending,
  session.error,
  () => config.appId,
  () => route.fullPath,
  () => props.identity.scopeKey.value,
  () => props.identity.status.value,
  () => props.identity.availableActions.value.join('|'),
]
const captureIntent = useCommandScope(sources)
watch(
  sources,
  () => {
    message.value = submitting.value
      ? 'The account, selected venue or its details changed. Send your request again.'
      : ''
    submitting.value = false
  },
  { flush: 'sync' }
)
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
  const isCurrent = captureIntent()
  const uid = currentUser.value?.uid
  // These fields are flat strings; capture the original request before credentials.
  const body = {
    prompt: prompt.value.trim(),
    identity: { ...props.identity.fields.value },
    availableActions: [...props.identity.availableActions.value],
  }
  submitting.value = true
  message.value = ''
  try {
    const user = await useRequireUser()
    if (!isCurrent() || user.uid !== uid) return
    const token = await user.getIdToken()
    if (!isCurrent()) return
    const intent = await $fetch<KitchenIdentityIntent>(
      '/api/workspace/kitchen/identity/intent',
      {
        method: 'POST',
        timeout: 60000,
        retry: 0,
        headers: { authorization: `Bearer ${token}` },
        body,
      }
    )
    if (!isCurrent()) return
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
    if (isCurrent())
      message.value =
        cause instanceof Error
          ? cause.message
          : 'Identity AI could not prepare that action.'
  } finally {
    if (isCurrent()) submitting.value = false
  }
}
</script>
