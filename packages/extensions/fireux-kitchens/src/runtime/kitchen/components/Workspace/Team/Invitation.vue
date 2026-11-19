<template>
  <UFormField v-if="manualLink" label="Copy this invitation link">
    <UInput :model-value="manualLink" readonly />
  </UFormField>
  <UButton
    v-else
    label="Copy invitation link"
    icon="i-lucide-link"
    variant="soft"
    :loading="busy"
    @click="copyInvitation"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '#imports'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const props = defineProps<{
  memberId: string
  createInvitation: (memberId: string) => Promise<{ link: string }>
}>()
const { currentUser } = useAuth()
const actorId = () => currentUser.value?.uid
const capture = useCommandScope([actorId])
const toast = useToast()
const busy = ref(false)
const manualLink = ref('')
watch(
  actorId,
  () => {
    manualLink.value = ''
    busy.value = false
  },
  { flush: 'sync' }
)

async function copyInvitation() {
  if (busy.value) return
  const isCurrent = capture()
  busy.value = true
  try {
    const { link } = await props.createInvitation(props.memberId)
    if (!isCurrent()) return
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      if (isCurrent()) manualLink.value = link
      return
    }
    if (isCurrent())
      toast.add({ title: 'Invitation link copied', color: 'success' })
  } catch (error) {
    if (isCurrent())
      toast.add({
        title: 'Invitation could not be created',
        description: error instanceof Error ? error.message : 'Try again.',
        color: 'error',
      })
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
