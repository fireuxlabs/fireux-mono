<template>
  <section class="fx-page-stack" aria-label="Delivery queue">
    <UButton :loading="loading" @click="load(false)"
      >Load delivery queue</UButton
    >
    <UButton to="/auth?redirect=/dashboard/menu-express" variant="outline"
      >Sign in</UButton
    >
    <UAlert
      v-if="error"
      color="error"
      title="Queue unavailable"
      :description="error"
    />
    <UButton
      v-for="request in items"
      :key="request.id"
      variant="outline"
      @click="$emit('select', request.id)"
      >{{ request.demo ? 'DEMO · ' : '' }}{{ request.venue }} ·
      {{ request.stage }}</UButton
    >
    <UButton v-if="hasMore" :loading="loading" @click="load(true)"
      >Load more requests</UButton
    >
    <UFormField label="Open request by ID"
      ><UInput v-model="requestedId" maxlength="36"
    /></UFormField>
    <UButton :disabled="!validRequestedId" @click="$emit('select', requestedId)"
      >Open selected request</UButton
    >
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { MenuExpressRequest } from '../../../shared/types/menu-express'
defineEmits<{ select: [id: string] }>()
const { currentUser } = useAuth()
const items = ref<MenuExpressRequest[]>([]),
  hasMore = ref(false),
  after = ref(''),
  loading = ref(false),
  error = ref(''),
  requestedId = ref('')
const validRequestedId = computed(() =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
    requestedId.value
  )
)
const captureIntent = useCommandScope([() => currentUser.value])
watch(
  () => currentUser.value,
  () => {
    items.value = []
    hasMore.value = false
    after.value = ''
    requestedId.value = ''
    loading.value = false
    error.value = ''
  },
  { flush: 'sync' }
)
async function load(more: boolean) {
  if (loading.value) return
  const isCurrent = captureIntent(),
    user = currentUser.value,
    cursor = after.value
  loading.value = true
  error.value = ''
  try {
    if (!user || user.isAnonymous)
      throw new Error('Sign in as a Misebox operator.')
    const credential = await user.getIdToken()
    if (!isCurrent()) return
    const data = await $fetch<{
      items: MenuExpressRequest[]
      hasMore: boolean
      after: string
    }>('/api/menu-express', {
      headers: { authorization: `Bearer ${credential}` },
      query: more ? { after: cursor } : undefined,
    })
    if (!isCurrent()) return
    items.value = more ? [...items.value, ...data.items] : data.items
    hasMore.value = data.hasMore
    after.value = data.after
  } catch (cause: any) {
    if (isCurrent()) error.value = cause?.data?.statusMessage || cause.message
  } finally {
    if (isCurrent()) loading.value = false
  }
}
</script>
