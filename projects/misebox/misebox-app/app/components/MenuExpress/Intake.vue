<template>
  <form class="fx-page-stack" @submit.prevent="submit">
    <UFormField label="Your name" required
      ><UInput v-model="form.name" required maxlength="120"
    /></UFormField>
    <UFormField label="Email" required
      ><UInput v-model="form.email" type="email" required maxlength="320"
    /></UFormField>
    <UFormField label="Venue name" required
      ><UInput v-model="form.venue" required maxlength="200"
    /></UFormField>
    <UFormField label="Location" required
      ><UInput v-model="form.location" required maxlength="300"
    /></UFormField>
    <UFormField
      label="Menu source link"
      description="Paste a menu, PDF or photo link. You can upload files after submitting."
      ><UInput v-model="form.sourceUrl" type="url" maxlength="2000"
    /></UFormField>
    <UFormField label="Instructions"
      ><UTextarea v-model="form.instructions" maxlength="2000"
    /></UFormField>
    <UCheckbox
      v-if="localDevelopment"
      v-model="form.demo"
      label="Labelled demo request — requires a signed-in Misebox operator"
    />
    <UAlert
      v-if="error"
      color="error"
      title="Request not submitted"
      :description="error"
    />
    <UButton type="submit" :loading="busy">Submit menu request</UButton>
    <p>
      Submitting a request does not charge you. Price and delivery terms are
      agreed before purchase.
    </p>
  </form>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
const localDevelopment = import.meta.dev
const { currentUser } = useAuth()
const form = reactive({
  name: '',
  email: '',
  venue: '',
  location: '',
  sourceUrl: '',
  instructions: '',
  demo: false,
})
const captureIntent = useCommandScope([
  () => currentUser.value,
  () => JSON.stringify(form),
])
const busy = ref(false),
  error = ref('')
const draftKey = 'misebox:menu-express:intake'
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey) || 'null')
    if (saved?.input) Object.assign(form, saved.input)
  } catch {
    localStorage.removeItem(draftKey)
  }
})
async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  const isCurrent = captureIntent()
  const snapshot = { ...form },
    user = currentUser.value
  try {
    let saved: { id: string; token: string; input: typeof snapshot } | null =
      JSON.parse(localStorage.getItem(draftKey) || 'null')
    if (!saved) {
      saved = {
        id: crypto.randomUUID(),
        token: [...crypto.getRandomValues(new Uint8Array(32))]
          .map((n) => n.toString(16).padStart(2, '0'))
          .join(''),
        input: snapshot,
      }
      localStorage.setItem(draftKey, JSON.stringify(saved))
    }
    if (JSON.stringify(saved.input) !== JSON.stringify(snapshot))
      throw new Error(
        'A submission is awaiting recovery. Restore your previous details and retry before starting another request.'
      )
    const headers =
      user && !user.isAnonymous
        ? { authorization: `Bearer ${await user.getIdToken()}` }
        : undefined
    if (!isCurrent())
      throw new Error('Account changed. Retry with the current account.')
    await $fetch('/api/menu-express', {
      method: 'POST',
      headers,
      body: { ...saved.input, id: saved.id, token: saved.token },
    })
    if (!isCurrent())
      throw new Error(
        'Request saved, but your account changed. Restore the original context to continue.'
      )
    localStorage.setItem(
      `misebox:menu-express:${saved.id}`,
      JSON.stringify({
        token: saved.token,
        expiresAt: Date.now() + 30 * 86400_000,
      })
    )
    localStorage.removeItem(draftKey)
    await navigateTo(`/menu-express/${saved.id}`)
  } catch (cause: any) {
    if (isCurrent()) {
      if (cause?.statusCode === 400 || cause?.status === 400)
        localStorage.removeItem(draftKey)
      error.value = cause?.data?.statusMessage || cause.message
    }
  } finally {
    busy.value = false
  }
}
</script>
