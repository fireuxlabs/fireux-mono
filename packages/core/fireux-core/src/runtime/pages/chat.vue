<template>
  <UPage>
    <UPageHeader
      :title="`Chat with ${fireux.appShortName || fireux.appName}`"
      description="Send a message to the app admin team. They can reply from the admin dashboard."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          Admin chat
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="mx-auto grid max-w-3xl gap-4">
        <UAlert
          v-if="statusMessage"
          :color="statusColor"
          :title="statusTitle"
          :description="statusMessage"
        />

        <UCard v-if="!conversationId">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Name" required>
              <UInput v-model="guest.name" placeholder="Your name" />
            </UFormField>

            <UFormField label="Email" required>
              <UInput v-model="guest.email" type="email" placeholder="you@example.com" />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <div class="min-h-[20rem]">
            <UChatMessages
              :messages="chatMessages"
              :status="chatStatus"
              :should-scroll-to-bottom="true"
              :user="{ side: 'right', variant: 'soft', icon: 'i-lucide-user' }"
              :assistant="{ side: 'left', variant: 'naked', icon: 'i-lucide-shield-check' }"
            />
          </div>

          <UChatPrompt
            v-model="draft"
            class="mt-4"
            placeholder="Write your message"
            :loading="submitting"
            @submit.prevent="sendMessage"
          >
            <template #footer>
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-muted">
                  Public chat starts a private admin conversation for this app.
                </p>
                <UChatPromptSubmit :status="chatStatus" label="Send" />
              </div>
            </template>
          </UChatPrompt>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, definePageMeta, onMounted, reactive, ref } from '#imports'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'
import { useConversationCreate } from '../composables/fireux/firestore/core/conversation/mutations/useConversationCreate'
import { useConversationMessageCreate } from '../composables/fireux/firestore/core/conversation/mutations/useConversationMessageCreate'
import { useConversationMessages } from '../composables/fireux/firestore/core/conversation/fetch/useConversationMessages'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

const fireux = useFireUXConfig()
const route = useRoute()
const storageKey = `fireux:${fireux.appId}:admin-chat`
const conversationId = ref('')
const draft = ref('')
const submitting = ref(false)
const statusTitle = ref('')
const statusMessage = ref('')
const statusColor = ref<'success' | 'warning' | 'error' | 'info'>('info')
const guest = reactive({
  name: '',
  email: '',
})

const { createConversation } = useConversationCreate()
const { createConversationMessage } = useConversationMessageCreate()
const { messages } = useConversationMessages(conversationId)

const chatStatus = computed<ChatStatus>(() =>
  submitting.value ? 'submitted' : statusColor.value === 'error' ? 'error' : 'ready'
)
const chatMessages = computed(() =>
  messages.value.map((message) => ({
    id: message.id,
    role: message.sender_type === 'user' ? 'assistant' : 'user',
    parts: [{ type: 'text', text: message.body }],
    metadata: {
      senderName: message.sender_name,
    },
  }))
)

onMounted(() => {
  conversationId.value = localStorage.getItem(storageKey) || ''
})

function requireGuestDetails() {
  if (conversationId.value) return true

  if (!guest.name.trim() || !guest.email.trim()) {
    statusColor.value = 'warning'
    statusTitle.value = 'Add your details'
    statusMessage.value = 'Please add your name and email before starting chat.'
    return false
  }

  return true
}

async function sendMessage() {
  const body = draft.value.trim()
  if (!body || submitting.value) return
  if (!requireGuestDetails()) return

  submitting.value = true
  statusMessage.value = ''

  try {
    if (!conversationId.value) {
      conversationId.value = await createConversation({
        app_id: fireux.appId,
        kind: 'general',
        related_entity: {
          family: 'apps',
          id: fireux.appId,
          path: `apps/${fireux.appId}`,
          label: fireux.appName,
        },
        guest_contact: {
          name: guest.name,
          email: guest.email,
          preferred_channel: 'chat',
        },
        source_route: route.fullPath,
        initial_message: {
          body,
          sender_type: 'guest',
          sender_name: guest.name,
        },
      })
      localStorage.setItem(storageKey, conversationId.value)
    } else {
      await createConversationMessage(conversationId.value, {
        body,
        sender_type: 'guest',
        sender_name: guest.name || 'Guest',
      })
    }

    draft.value = ''
    statusColor.value = 'success'
    statusTitle.value = 'Message sent'
    statusMessage.value = 'The admin team can reply from their dashboard.'
  } catch (error) {
    statusColor.value = 'error'
    statusTitle.value = 'Message not sent'
    statusMessage.value = error instanceof Error ? error.message : 'Please try again.'
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: computed(() => `Chat with ${fireux.appShortName || fireux.appName}`),
  description: 'Start a conversation with the app admin team.',
})
</script>
