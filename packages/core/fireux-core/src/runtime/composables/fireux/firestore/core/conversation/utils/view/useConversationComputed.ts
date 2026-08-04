import { computed, type Ref } from 'vue'
import type { Conversation } from '../../../../../../../models/operations/conversation.model'

const clean = (value: unknown) => String(value || '').trim()

function titleCaseStatus(status: Conversation['status']) {
  if (status === 'open') return 'Open'
  if (status === 'pending') return 'Pending'
  if (status === 'closed') return 'Closed'
  return 'Archived'
}

export function useConversationComputed(
  conversation?: Ref<Conversation | null | undefined>
) {
  const status = computed<Conversation['status']>(() =>
    conversation?.value?.status ?? 'open'
  )
  const hasConversation = computed(() => Boolean(conversation?.value?.id))
  const isOpen = computed(() => status.value === 'open')
  const isPending = computed(() => status.value === 'pending')
  const isClosed = computed(() => status.value === 'closed')
  const isArchived = computed(() => status.value === 'archived')
  const hasGuestContact = computed(() =>
    Boolean(
      clean(conversation?.value?.guest_contact?.name) ||
        clean(conversation?.value?.guest_contact?.email) ||
        clean(conversation?.value?.guest_contact?.phone)
    )
  )
  const hasRelatedEntity = computed(() =>
    Boolean(
      clean(conversation?.value?.related_entity?.family) &&
        clean(conversation?.value?.related_entity?.id)
    )
  )
  const lastMessageBody = computed(() =>
    clean(conversation?.value?.last_message?.body)
  )
  const displayStatus = computed(() => titleCaseStatus(status.value))

  return {
    hasConversation,
    isOpen,
    isPending,
    isClosed,
    isArchived,
    hasGuestContact,
    hasRelatedEntity,
    lastMessageBody,
    displayStatus,
  }
}
