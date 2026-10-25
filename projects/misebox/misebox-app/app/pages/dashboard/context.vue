<template>
  <UDashboardPanel id="misebox-app-context">
    <template #header><FireLayoutsDashboardNavbar title="AI context" /></template>
    <template #body>
      <div class="space-y-5 max-w-3xl">
        <p class="text-muted">
          App product background used by this AI. Workspace records remain
          separate.
        </p>
        <UButton
          label="Reload context"
          color="neutral"
          variant="soft"
          :loading="loading"
          @click="load"
        />
        <UAlert
          v-if="error"
          color="error"
          :description="error"
          title="Context unavailable"
        />
        <FireCopyError v-if="error" :message="error" />
        <UCard v-if="data">
          <template #header
            ><div class="flex justify-between gap-3">
              <h1 class="text-xl font-semibold">{{ data.context.title }}</h1>
              <UBadge color="neutral">{{ data.context.reviewStatus }}</UBadge>
            </div></template
          >
          <p class="whitespace-pre-line">{{ data.context.summary }}</p>
          <p class="mt-4 text-sm text-muted">
            Source: {{ data.context.source }}
          </p>
          <p class="mt-2 text-xs text-muted">{{ data.sourcePath }}</p>
          <template #footer
            ><UButton
              label="Copy AI context"
              color="neutral"
              variant="ghost"
              @click="copy"
          /></template>
        </UCard>
        <form v-if="data" class="space-y-3" @submit.prevent="ask">
          <UFormField label="Ask about Misebox"
            ><UTextarea
              v-model="prompt"
              class="w-full"
              maxlength="1000"
              placeholder="What does Misebox mean by Team?"
          /></UFormField>
          <UButton
            type="submit"
            label="Ask AI"
            :loading="asking"
            :disabled="!prompt.trim() || loading"
          />
          <p v-if="answer" class="whitespace-pre-line">{{ answer }}</p>
        </form>
        <p class="text-sm text-muted">
          Sharing grants the owning FireUX Project’s managers read access to
          this product context. Misebox keeps the original.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { MiseboxProductContextResponse } from '../../models/product-context'
definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  roles: ['admin', 'dev'],
  nav: {
    key: 'misebox-context',
    label: 'AI context',
    icon: 'i-lucide-notebook-text',
    position: 'middle',
    order: 11,
    desktop: true,
    layouts: ['dashboard'],
  },
})
useHead({ title: 'AI context | Misebox' })
const data = ref<MiseboxProductContextResponse | null>(null)
const loading = ref(false),
  asking = ref(false),
  error = ref(''),
  prompt = ref(''),
  answer = ref('')
let generation = 0
onBeforeUnmount(() => {
  generation++
})
async function headers() {
  const user = await useRequireUser()
  return { authorization: `Bearer ${await user.getIdToken()}` }
}
async function load() {
  const current = ++generation
  loading.value = true
  error.value = ''
  data.value = null
  answer.value = ''
  try {
    const result = await $fetch<MiseboxProductContextResponse>(
      '/api/app/context/product',
      { headers: await headers(), timeout: 15000, retry: 0 }
    )
    if (current === generation) data.value = result
  } catch (cause) {
    if (current === generation)
      error.value =
        cause instanceof Error ? cause.message : 'Could not load context.'
  } finally {
    if (current === generation) loading.value = false
  }
}
async function ask() {
  if (!data.value || asking.value) return
  const current = generation,
    revision = data.value.revision
  asking.value = true
  error.value = ''
  answer.value = ''
  try {
    const result = await $fetch<{ answer: string; revision: string }>(
      '/api/app/context/product-ask',
      {
        method: 'POST',
        headers: await headers(),
        body: { prompt: prompt.value, revision },
        timeout: 60000,
        retry: 0,
      }
    )
    if (current === generation && result.revision === data.value?.revision)
      answer.value = result.answer
  } catch (cause) {
    if (current === generation)
      error.value = cause instanceof Error ? cause.message : 'Could not answer.'
  } finally {
    asking.value = false
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(data.value, null, 2))
  } catch {
    error.value = 'Could not copy context.'
  }
}
onMounted(load)
</script>
