<template>
  <section class="overflow-hidden rounded-xl border border-default bg-elevated">
    <div class="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div class="flex min-w-0 items-start gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted shadow-sm"
        >
          <UIcon name="i-lucide-sparkles" class="size-5" />
        </div>

        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary">
              Misebox AI
            </p>
            <UBadge color="neutral" variant="soft" size="sm">
              Menu
            </UBadge>
          </div>
          <h2 class="text-lg font-semibold text-highlighted">
            How can I help manage your Menus today?
          </h2>
          <p class="max-w-2xl text-sm text-muted">
            Ask about the selected Kitchen's menus, dishes, prices, images or
            publishing.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 lg:justify-end">
        <span class="text-xs font-medium text-muted">Context contract</span>
        <UBadge
          v-for="scope in contextScopes"
          :key="scope.label"
          color="neutral"
          variant="outline"
          size="sm"
        >
          <UIcon :name="scope.icon" class="size-3.5" />
          {{ scope.label }}
        </UBadge>
      </div>
    </div>

    <div class="border-t border-default bg-default/40 p-4 sm:p-5">
      <div class="space-y-3">
        <div v-if="messages.length" class="space-y-3" aria-live="polite">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm sm:max-w-[80%]"
              :class="
                message.role === 'user'
                  ? 'bg-primary text-inverted'
                  : 'border border-default bg-elevated text-highlighted'
              "
            >
              {{ message.body }}
            </div>
          </div>
        </div>

        <UChatPrompt
          v-model="draft"
          placeholder="Ask Misebox AI about your menus"
          :loading="submitting"
          @submit.prevent="askMenuAi"
        >
          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs text-muted">
                Confirmed context + current Menu records
              </p>
              <UChatPromptSubmit :status="chatStatus" label="Ask" />
            </div>
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2" aria-label="Suggested Menu questions">
          <UButton
            v-for="suggestion in suggestions"
            :key="suggestion"
            color="neutral"
            variant="soft"
            size="sm"
            @click="draft = suggestion"
          >
            {{ suggestion }}
          </UButton>
        </div>

        <p v-if="scopeSummary" class="text-xs text-muted">
          {{ scopeSummary }}
        </p>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          title="Misebox AI could not answer"
          :description="errorMessage"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useKitchenMenusWorkspace } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'

type MenuAiMessage = {
  id: string
  role: 'assistant' | 'user'
  body: string
}

type MenuAiResponse = {
  ok: true
  answer: string
  scope: {
    userContext: boolean
    menuContext: boolean
    menuCount: number
    source: 'ai' | 'records'
    contextSaved: boolean
    usage?: {
      amount: string
      currency: string
    }
  }
}

const developmentDraft = import.meta.dev ? 'Summarise these menus' : ''
const draft = ref(developmentDraft)
const submitting = ref(false)
const errorMessage = ref('')
const messages = ref<MenuAiMessage[]>([])
const responseScope = ref<MenuAiResponse['scope'] | null>(null)
const workspace = useKitchenMenusWorkspace()

const chatStatus = computed<'ready' | 'submitted' | 'error'>(() =>
  submitting.value ? 'submitted' : errorMessage.value ? 'error' : 'ready'
)

const scopeSummary = computed(() => {
  const scope = responseScope.value
  if (!scope) return ''
  const contexts = [
    scope.userContext ? 'Misebox User context' : '',
    scope.menuContext ? 'Menu context' : '',
  ].filter(Boolean)
  return [
    `Checked ${scope.menuCount} current ${scope.menuCount === 1 ? 'Menu' : 'Menus'}`,
    scope.source === 'records' ? 'Answered from Menu records' : 'Misebox AI',
    scope.contextSaved ? 'Saved to Menu context' : '',
    scope.usage ? `AI usage ${scope.usage.amount}` : '',
    ...contexts,
  ].filter(Boolean).join(' · ')
})

const contextScopes = [
  { label: 'You', icon: 'i-lucide-user' },
  { label: 'Kitchen', icon: 'i-lucide-store' },
  { label: 'Menus', icon: 'i-lucide-book-open' },
] as const

const suggestions = [
  'Summarise these menus',
  'Find missing dish information',
  'Review menu images',
  'Help me update prices',
] as const

async function askMenuAi() {
  const prompt = draft.value.trim()
  if (!prompt || submitting.value) return
  const appId = String(workspace.activeKitchenAppId.value || '').trim()
  const kitchenId = String(
    workspace.storageKitchenId.value || workspace.kitchenId.value || ''
  ).trim()
  if (!appId || !kitchenId) {
    errorMessage.value = 'Select a live Kitchen before asking about its Menus.'
    return
  }

  messages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    body: prompt,
  })
  draft.value = developmentDraft
  errorMessage.value = ''
  submitting.value = true

  try {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const response = await $fetch<MenuAiResponse>(
      '/api/console/kitchen/menus/ai',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { appId, kitchenId, prompt },
      }
    )
    if (response.scope.contextSaved) await workspace.refresh()
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
      'Misebox AI could not answer this Menu question.'
  } finally {
    submitting.value = false
  }
}
</script>
