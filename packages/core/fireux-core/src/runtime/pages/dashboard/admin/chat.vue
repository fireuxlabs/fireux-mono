<template>
  <UDashboardPanel id="admin-chat">
    <template #header>
      <LayoutsDashboardNavbar title="Admin Chat" />
    </template>

    <template #body>
      <div class="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <UCard>
          <div class="space-y-4">
            <div>
              <h2 class="font-semibold">Conversations</h2>
              <p class="text-sm text-muted">
                Public messages sent to {{ fireux.appShortName || fireux.appName }}.
              </p>
            </div>

            <UAlert
              v-if="!conversationSurfaces.length && !pending"
              color="neutral"
              variant="soft"
              title="No conversations yet"
              description="When visitors use /chat, their messages appear here."
            />

            <div class="grid gap-2">
              <UButton
                v-for="conversation in conversationSurfaces"
                :key="conversation.id"
                :color="conversation.id === selectedConversationId ? 'primary' : 'neutral'"
                :variant="conversation.id === selectedConversationId ? 'soft' : 'ghost'"
                class="justify-start"
                @click="selectConversation(conversation.id)"
              >
                <span class="min-w-0 text-left">
                  <span class="block truncate font-medium">
                    {{ conversation.contact_label }}
                  </span>
                  <span class="block truncate text-xs opacity-75">
                    {{ conversation.last_message_preview || conversation.related_label }}
                  </span>
                </span>
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard>
          <div v-if="selectedConversationId" class="space-y-4">
            <div>
              <h2 class="font-semibold">
                {{ selectedConversation?.title || 'Conversation' }}
              </h2>
              <p class="text-sm text-muted">
                {{ selectedConversation?.subtitle || 'App admin chat' }}
              </p>
            </div>

            <div class="min-h-[24rem]">
              <UChatMessages
                :messages="chatMessages"
                :status="chatStatus"
                :should-scroll-to-bottom="true"
                :user="{ side: 'right', variant: 'soft', icon: 'i-lucide-shield-check' }"
                :assistant="{ side: 'left', variant: 'naked', icon: 'i-lucide-user' }"
              />
            </div>

            <UChatPrompt
              v-model="reply"
              placeholder="Reply as admin"
              :loading="submitting"
              @submit.prevent="sendReply"
            >
              <template #footer>
                <div class="flex justify-end">
                  <UChatPromptSubmit :status="chatStatus" label="Reply" />
                </div>
              </template>
            </UChatPrompt>
          </div>

          <UAlert
            v-else
            color="neutral"
            variant="soft"
            title="Select a conversation"
            description="Choose a visitor conversation to read and reply."
          />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, ref } from '#imports'
import { useRoute, useRouter } from 'vue-router'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useConversationCollection } from '../../../composables/fireux/firestore/core/conversation/fetch/useConversationCollection'
import { useConversationMessages } from '../../../composables/fireux/firestore/core/conversation/fetch/useConversationMessages'
import { useConversationMessageCreate } from '../../../composables/fireux/firestore/core/conversation/mutations/useConversationMessageCreate'
import { useConversationInterface } from '../../../composables/fireux/firestore/core/conversation/utils/view/useConversationInterface'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

const fireux = useFireUXConfig()
const route = useRoute()
const router = useRouter()
const { user } = useUser()
const reply = ref('')
const submitting = ref(false)
const failed = ref(false)
const { toConversationSurface } = useConversationInterface()
const { createConversationMessage } = useConversationMessageCreate()
const { conversations, pending } = useConversationCollection({
  filter: computed(() => ({
    appId: fireux.appId,
  })),
})

const conversationSurfaces = computed(() =>
  conversations.value
    .map((conversation) => toConversationSurface(conversation))
    .filter(Boolean)
)
const selectedConversationId = computed(() =>
  String(route.query.conversation || conversationSurfaces.value[0]?.id || '').trim()
)
const selectedConversation = computed(() =>
  conversationSurfaces.value.find((conversation) => conversation.id === selectedConversationId.value) ?? null
)
const { messages } = useConversationMessages(selectedConversationId)
const chatStatus = computed<ChatStatus>(() =>
  submitting.value ? 'submitted' : failed.value ? 'error' : 'ready'
)
const chatMessages = computed(() =>
  messages.value.map((message) => ({
    id: message.id,
    role: message.sender_type === 'user' ? 'user' : 'assistant',
    parts: [{ type: 'text', text: message.body }],
    metadata: {
      senderName: message.sender_name,
    },
  }))
)

function selectConversation(id: string) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      conversation: id,
    },
  })
}

async function sendReply() {
  const body = reply.value.trim()
  if (!body || !selectedConversationId.value || submitting.value) return

  submitting.value = true
  failed.value = false

  try {
    await createConversationMessage(selectedConversationId.value, {
      body,
      sender_id: user.value?.id || '',
      sender_type: 'user',
      sender_name: user.value?.display_name || 'Admin',
      read_by: user.value?.id ? [user.value.id] : [],
    })
    reply.value = ''
  } catch {
    failed.value = true
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-admin-chat',
    label: 'Chat',
    icon: 'i-lucide-message-circle',
    position: 'top',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
