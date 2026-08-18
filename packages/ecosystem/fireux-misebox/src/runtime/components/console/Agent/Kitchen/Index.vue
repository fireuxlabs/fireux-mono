<template>
  <section class="space-y-4">
    <UCard>
      <div class="space-y-4">
        <div>
          <p class="font-medium text-highlighted">Ask KitchenAI</p>
          <p class="mt-1 text-sm text-muted">
            KitchenAI starts with this Kitchen, then delegates detailed work to its operation agents.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="soft">You</UBadge>
            <UBadge color="neutral" variant="soft">Kitchen</UBadge>
            <UBadge color="neutral" variant="soft">Menus</UBadge>
          </div>
          <UButton
            icon="i-lucide-sparkles"
            :loading="submitting"
            :disabled="submitting"
            @click="summariseKitchen"
          >
            Summarise this Kitchen
          </UButton>
        </div>
      </div>
    </UCard>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="KitchenAI could not answer"
      :description="errorMessage"
    />

    <UCard v-for="message in messages" :key="message.id">
      <div class="space-y-2">
        <p class="text-xs font-medium uppercase tracking-wide text-muted">
          {{ message.role === 'user' ? 'You' : 'KitchenAI' }}
        </p>
        <p class="whitespace-pre-wrap text-sm text-highlighted">
          {{ message.body }}
        </p>
      </div>
    </UCard>

    <p v-if="scopeSummary" class="text-xs text-muted">{{ scopeSummary }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useKitchenConsole } from 'fireux-kitchens/runtime/kitchen/composables/console/core/useKitchenConsole'

type Message = { id: string; role: 'assistant' | 'user'; body: string }
type KitchenAgentScope = {
  source: 'ai' | 'codex' | 'simulator'
  kitchenName: string
  userContext: boolean
  kitchenContext: boolean
  menuContext: boolean
  menuCount: number
  delegates: string[]
  usage: { amount: string; currency: string }
}

const developmentPrompt = 'Summarise this Kitchen'
const submitting = ref(false)
const errorMessage = ref('')
const messages = ref<Message[]>([])
const responseScope = ref<KitchenAgentScope | null>(null)
const kitchenConsole = useKitchenConsole()

const scopeSummary = computed(() => {
  const scope = responseScope.value
  if (!scope) return ''
  return [
    scope.kitchenName,
    `${scope.menuCount} current ${scope.menuCount === 1 ? 'Menu' : 'Menus'}`,
    scope.source === 'simulator'
      ? 'Local fixture · no model'
      : scope.source === 'codex'
        ? 'Codex dev · bounded production context · no provider tokens'
        : `AI usage ${scope.usage.amount}`,
    scope.userContext ? 'User context' : '',
    scope.kitchenContext ? 'Kitchen context' : '',
    scope.menuContext ? 'Menu context' : '',
    scope.delegates.length ? `Delegated to ${scope.delegates.join(', ')}` : '',
  ].filter(Boolean).join(' · ')
})

async function summariseKitchen() {
  if (submitting.value) return
  const prompt = developmentPrompt
  const appId = String(kitchenConsole.runtime.appId.value || '').trim()
  const kitchenId = String(
    kitchenConsole.runtime.storageKitchenId.value ||
      kitchenConsole.selection.kitchenId.value || ''
  ).trim()
  if (!appId || !kitchenId) {
    errorMessage.value = 'Select a live Kitchen before asking KitchenAI.'
    return
  }

  messages.value.push({ id: `user-${Date.now()}`, role: 'user', body: prompt })
  errorMessage.value = ''
  submitting.value = true

  try {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const response = await $fetch<{
      ok: true
      answer: string
      scope: KitchenAgentScope
    }>('/api/console/kitchen/agent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { appId, kitchenId, prompt },
    })
    messages.value.push({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      body: response.answer,
    })
    responseScope.value = response.scope
  } catch (error) {
    const failure = error as {
      data?: { statusMessage?: string; message?: string }
      message?: string
    }
    errorMessage.value =
      failure.data?.statusMessage ||
      failure.data?.message ||
      failure.message ||
      'KitchenAI could not answer this Kitchen question.'
  } finally {
    submitting.value = false
  }
}
</script>
