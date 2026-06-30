import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useFirestoreResolver } from '../../../vuefire'
import type {
  Conversation,
  ConversationMessage,
  ConversationMessageCreateInput,
  ConversationParticipantType,
} from '../../../../../../models/core/conversation.model'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useConversationPaths } from '../utils/paths/useConversationPaths'

type CreateConversationMessageInput = {
  app_id?: string
  body: string
  sender_id?: string
  sender_type?: ConversationParticipantType
  sender_name?: string
  read_by?: string[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

const toStringList = (values: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => normalizeString(value))
        .filter(Boolean)
    )
  )

export function useConversationMessageCreate() {
  const resolveDb = useFirestoreResolver()
  const { createDocument } = useFirestoreCreate()
  const scopedAppId = ref('')
  const paths = useConversationPaths(scopedAppId)

  async function createConversationMessage(
    conversationId: string,
    input: CreateConversationMessageInput
  ): Promise<string> {
    const id = normalizeString(conversationId)
    const body = normalizeString(input.body)
    const senderType = input.sender_type ?? 'guest'
    const senderName = normalizeString(input.sender_name) || (senderType === 'user' ? 'Admin' : 'Guest')
    const senderId = normalizeString(input.sender_id)
    const readBy = toStringList(input.read_by)
    scopedAppId.value = normalizeString(input.app_id)

    if (!id) {
      throw new Error('Conversation id is required')
    }

    if (!body) {
      throw new Error('Message body is required')
    }

    const messageCollectionPath = paths.messageCollectionPath(id).value
    const conversationCollectionPath = paths.collectionPath.value

    if (!messageCollectionPath || !conversationCollectionPath) {
      throw new Error('Conversation app path is required')
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
      messageCollectionPath,
      message,
      { app: true }
    )

    await setDoc(
      doc(resolveDb(), conversationCollectionPath, id),
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
