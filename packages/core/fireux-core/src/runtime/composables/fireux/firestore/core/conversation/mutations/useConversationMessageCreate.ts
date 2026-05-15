import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useFirestoreResolver } from '../../../vuefire'
import type {
  Conversation,
  ConversationMessage,
  ConversationMessageCreateInput,
  ConversationParticipantType,
} from '../../../../../../models/core/conversation.model'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

type CreateConversationMessageInput = {
  body: string
  sender_id?: string
  sender_type?: ConversationParticipantType
  sender_name?: string
  read_by?: string[]
}

const clean = (value: unknown) => String(value || '').trim()

const toStringList = (values: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => clean(value))
        .filter(Boolean)
    )
  )

export function useConversationMessageCreate() {
  const resolveDb = useFirestoreResolver()
  const { createDocument } = useFirestoreCreate()

  async function createConversationMessage(
    conversationId: string,
    input: CreateConversationMessageInput
  ): Promise<string> {
    const id = clean(conversationId)
    const body = clean(input.body)
    const senderType = input.sender_type ?? 'guest'
    const senderName = clean(input.sender_name) || (senderType === 'user' ? 'Admin' : 'Guest')
    const senderId = clean(input.sender_id)
    const readBy = toStringList(input.read_by)

    if (!id) {
      throw new Error('Conversation id is required')
    }

    if (!body) {
      throw new Error('Message body is required')
    }

    const message: ConversationMessageCreateInput = {
      conversation_id: id,
      sender_id: senderId,
      sender_type: senderType,
      sender_name: senderName,
      body,
      read_by: readBy,
    }

    const messageId = await createDocument<Partial<ConversationMessage>>(
      `conversations/${id}/messages`,
      message,
      { app: true }
    )

    await setDoc(
      doc(resolveDb(), 'conversations', id),
      {
        last_message: {
          body,
          sender_id: senderId,
          sender_type: senderType,
          sender_name: senderName,
          created_at: serverTimestamp(),
        },
        updated: {
          at: serverTimestamp(),
        },
      } as unknown as Partial<Conversation>,
      { merge: true }
    )

    return messageId
  }

  return {
    createConversationMessage,
  }
}
