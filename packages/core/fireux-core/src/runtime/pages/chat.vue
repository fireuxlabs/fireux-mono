<template>
  <UPage>
    <UPageHeader
      :title="`Chat with ${fireux.appShortName || fireux.appName}`"
      description="Start a private conversation with this App team."
    >
      <template #headline>
        <UBadge color="primary" variant="soft"> Admin chat </UBadge>
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
              <UInput
                v-model="guest.email"
                type="email"
                placeholder="you@example.com"
              />
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
              :assistant="{
                side: 'left',
                variant: 'naked',
                icon: 'i-lucide-shield-check',
              }"
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
                  Your recovery key stays in this browser for 30 days.
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
import { refreshNuxtData } from 'nuxt/app'

import { computed, definePageMeta, onMounted, reactive, ref } from '#imports'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from '../app/composables/config/FireUXConfig'
import { useAuth } from '../composables/fireux/firebase/useAuth'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'
type ChatMessage = {
  id: string
  body: string
  sender_name: string
  sender_type: 'admin' | 'user' | 'guest' | 'system'
  created_at: string
}
type StoredChatSession = {
  conversationId: string
  token: string
  expiresAt: string
}

const fireux = useFireUXConfig()
const route = useRoute()
const { uid, currentUser } = useAuth()
const storageKey = `fireux:${fireux.appId}:admin-chat`
const conversationId = ref('')
const recoveryToken = ref('')
const messages = ref<ChatMessage[]>([])
const draft = ref('')
const submitting = ref(false)
const statusTitle = ref('')
const statusMessage = ref('')
const statusColor = ref<'success' | 'warning' | 'error' | 'info'>('info')
const guest = reactive({
  name: '',
  email: '',
})

const chatStatus = computed<ChatStatus>(() =>
  submitting.value
    ? 'submitted'
    : statusColor.value === 'error'
      ? 'error'
      : 'ready'
)
const senderName = computed(
  () => currentUser.value?.displayName || guest.name || 'User'
)
const senderEmail = computed(() => currentUser.value?.email || guest.email)
const chatMessages = computed(() =>
  messages.value.map((message) => ({
    id: message.id,
    role:
      message.sender_type === 'admin'
        ? ('assistant' as const)
        : ('user' as const),
    parts: [{ type: 'text' as const, text: message.body }],
    metadata: {
      senderName: message.sender_name,
    },
  }))
)

onMounted(async () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(storageKey) || 'null'
    ) as StoredChatSession | null
    const expiresAt = Date.parse(String(stored?.expiresAt ?? ''))
    if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
      conversationId.value = String(stored?.conversationId ?? '')
      recoveryToken.value = String(stored?.token ?? '')
      await refreshSession()
    } else {
      localStorage.removeItem(storageKey)
    }
  } catch {
    localStorage.removeItem(storageKey)
  }
})

async function requestHeaders() {
  const user = currentUser.value
  if (!user || user.isAnonymous) return undefined
  const token = await user.getIdToken()
  return { authorization: `Bearer ${token}` }
}

async function refreshSession() {
  if (!conversationId.value || !recoveryToken.value) return
  const response = await $fetch<{
    messages: ChatMessage[]
  }>('/api/chat/session', {
    onResponse: async ({ options, response }) => {
      if (
        response.ok &&
        !['GET', 'HEAD'].includes(String(options.method || 'GET').toUpperCase())
      )
        await refreshNuxtData()
    },
    method: 'POST',
    headers: await requestHeaders(),
    body: {
      conversation_id: conversationId.value,
      token: recoveryToken.value,
    },
  })
  messages.value = response.messages
}

function requireGuestDetails() {
  if (conversationId.value) return true
  if (uid.value) return true

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
      const session = await $fetch<{
        conversation_id: string
        token: string
        expires_at: string
      }>('/api/chat/start', {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'POST',
        headers: await requestHeaders(),
        body: {
          name: senderName.value,
          email: senderEmail.value,
          body,
          source_route: route.fullPath,
        },
      })
      conversationId.value = session.conversation_id
      recoveryToken.value = session.token
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          conversationId: session.conversation_id,
          token: session.token,
          expiresAt: session.expires_at,
        } satisfies StoredChatSession)
      )
    } else {
      await $fetch('/api/chat/message', {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'POST',
        headers: await requestHeaders(),
        body: {
          conversation_id: conversationId.value,
          token: recoveryToken.value,
          body,
        },
      })
    }

    await refreshSession()
    draft.value = ''
    statusColor.value = 'success'
    statusTitle.value = 'Message sent'
    statusMessage.value = 'Your message is stored in this private chat.'
  } catch (error) {
    statusColor.value = 'error'
    statusTitle.value = 'Message not sent'
    statusMessage.value =
      error instanceof Error ? error.message : 'Please try again.'
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: computed(() => `Chat with ${fireux.appShortName || fireux.appName}`),
  description: 'Start a conversation with the admin team.',
})
</script>
