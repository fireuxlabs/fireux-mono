<template>
  <UDashboardPanel id="chat">
    <template #header>
      <LayoutsDashboardNavbar title="Messages" />
    </template>

    <template #body>
      <div class="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <UCard>
          <div class="space-y-5">
            <div>
              <div class="flex items-center justify-between gap-3">
                <h2 class="font-semibold">{{ inboxTitle }}</h2>

                <UBadge color="neutral" variant="soft">
                  {{ conversationsLabel }}
                </UBadge>
              </div>

              <p class="text-sm text-muted">{{ inboxDescription }}</p>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <UCard
                v-for="metric in conversationMetrics"
                :key="metric.label"
                variant="subtle"
                :ui="{ body: 'p-3' }"
              >
                <div class="text-lg font-semibold">{{ metric.value }}</div>
                <div class="text-xs text-muted">{{ metric.label }}</div>
              </UCard>
            </div>

            <UAlert
              v-if="pending"
              color="neutral"
              variant="soft"
              title="Loading messages"
              description="Checking messages for this app."
            />

            <UAlert
              v-if="!conversationSurfaces.length && !pending"
              color="neutral"
              variant="soft"
              :title="emptyTitle"
              :description="emptyDescription"
            >
              <template #actions>
                <UButton to="/chat" color="primary" variant="soft" size="sm">
                  Open chat with admin
                </UButton>
              </template>
            </UAlert>

            <div class="grid gap-2">
              <UButton
                v-for="conversation in conversationSurfaces"
                :key="conversation.id"
                :color="conversation.id === selectedConversationId ? 'primary' : 'neutral'"
                :variant="conversation.id === selectedConversationId ? 'soft' : 'ghost'"
                class="justify-start"
                @click="selectConversation(conversation.id)"
              >
                <span class="min-w-0 flex-1 text-left">
                  <span class="flex min-w-0 items-center gap-3">
                    <UIcon
                      :name="iconForKind(conversation.kind)"
                      class="size-4 shrink-0 opacity-70"
                    />

                    <span class="block truncate font-medium">
                      {{ conversation.contact_label }}
                    </span>

                    <UBadge
                      :color="statusColor(conversation.status)"
                      variant="soft"
                      size="xs"
                      class="ml-auto shrink-0"
                    >
                      {{ conversation.status }}
                    </UBadge>
                  </span>

                  <span class="mt-1 block truncate text-xs opacity-75">
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
                {{ selectedConversation?.subtitle || 'App chat' }}
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
              :placeholder="replyPlaceholder"
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
            :title="emptyTitle"
            :description="emptyDescription"
          >
            <template #actions>
              <UButton to="/chat" color="primary" variant="soft" size="sm">
                Open chat with admin
              </UButton>
              <UButton
                v-if="isAdmin"
                to="/dashboard/admin"
                color="neutral"
                variant="ghost"
                size="sm"
              >
                Back to admin
              </UButton>
            </template>
          </UAlert>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, ref } from '#imports'
import { useRoute, useRouter } from 'vue-router'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useConversationCollection } from '../../composables/fireux/firestore/core/conversation/fetch/useConversationCollection'
import { useConversationMessages } from '../../composables/fireux/firestore/core/conversation/fetch/useConversationMessages'
import { useConversationMessageCreate } from '../../composables/fireux/firestore/core/conversation/mutations/useConversationMessageCreate'
import { useConversationInterface } from '../../composables/fireux/firestore/core/conversation/utils/view/useConversationInterface'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import type {
  ConversationKind,
  ConversationStatus,
} from '../../models/core/conversation.model'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

const fireux = useFireUXConfig()
const route = useRoute()
const router = useRouter()
const { user, isAdmin } = useUser()
const reply = ref('')
const submitting = ref(false)
const failed = ref(false)
const { toConversationSurface } = useConversationInterface()
const { createConversationMessage } = useConversationMessageCreate()
const { conversations, pending } = useConversationCollection({
  filter: computed(() => ({
    appId: fireux.appId,
    participantId: isAdmin.value ? null : user.value?.id || '__no-user__',
  })),
})

const conversationSurfaces = computed(() =>
  conversations.value
    .map((conversation) => toConversationSurface(conversation))
    .filter(Boolean)
)
const openCount = computed(
  () =>
    conversationSurfaces.value.filter(
      (conversation) => conversation.status === 'open'
    ).length
)
const pendingCount = computed(
  () =>
    conversationSurfaces.value.filter(
      (conversation) => conversation.status === 'pending'
    ).length
)
const conversationsLabel = computed(() => {
  const count = conversationSurfaces.value.length
  return count === 1 ? '1 total' : `${count} total`
})
const conversationMetrics = computed(() => [
  { label: 'Open', value: openCount.value },
  { label: 'Pending', value: pendingCount.value },
  { label: 'Total', value: conversationSurfaces.value.length },
])
const inboxTitle = computed(() =>
  isAdmin.value ? 'Messages from visitors' : 'Your messages'
)
const inboxDescription = computed(() =>
  isAdmin.value
    ? 'Messages people send to the app admin.'
    : 'Conversations you have with this app.'
)
const emptyTitle = computed(() =>
  isAdmin.value ? 'No messages yet' : 'No messages yet'
)
const emptyDescription = computed(() =>
  isAdmin.value
    ? 'When visitors chat with the admin, their messages appear here.'
    : 'Start a chat with the app admin when you need help.'
)
const replyPlaceholder = computed(() =>
  isAdmin.value ? 'Reply as admin' : 'Write your reply'
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

function iconForKind(kind: ConversationKind) {
  if (kind === 'property_enquiry') return 'i-lucide-home'
  if (kind === 'guest_support') return 'i-lucide-life-buoy'
  if (kind === 'provider_lead') return 'i-lucide-user-round-search'
  return 'i-lucide-message-circle'
}

function statusColor(status: ConversationStatus) {
  if (status === 'open') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'closed') return 'neutral'
  return 'neutral'
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
    key: 'dashboard-chat',
    label: 'Messages',
    icon: 'i-lucide-message-circle',
    position: 'top',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
</script>
