import type { Conversation } from '../../../../../../../models/operations/conversation.model'

export type ConversationSurface = Conversation & {
  title: string
  subtitle: string
  contact_label: string
  related_label: string
  last_message_preview: string
}

const clean = (value: unknown) => String(value || '').trim()

function titleForKind(kind: Conversation['kind']) {
  if (kind === 'property_enquiry') return 'Property enquiry'
  if (kind === 'guest_support') return 'Guest support'
  if (kind === 'provider_lead') return 'Provider lead'
  return 'Conversation'
}

export function useConversationInterface() {
  function toConversationSurface(
    conversation: Conversation | null | undefined
  ): ConversationSurface | null {
    if (!conversation?.id) return null

    const contactLabel =
      clean(conversation.guest_contact?.name) ||
      clean(conversation.last_message?.sender_name) ||
      'Guest'
    const relatedLabel =
      clean(conversation.related_entity?.label) ||
      clean(conversation.related_entity?.id) ||
      'Related item'
    const lastMessagePreview = clean(conversation.last_message?.body)

    return {
      ...conversation,
      title: `${titleForKind(conversation.kind)} from ${contactLabel}`,
      subtitle: relatedLabel,
      contact_label: contactLabel,
      related_label: relatedLabel,
      last_message_preview: lastMessagePreview,
    }
  }

  return {
    toConversationSurface,
  }
}
