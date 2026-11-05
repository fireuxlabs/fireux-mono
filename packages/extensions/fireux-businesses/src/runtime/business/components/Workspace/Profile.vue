<template>
  <UCard>
    <template #header>Business profile and locations</template>
    <p>Use the business contact details customers should see.</p>
    <form class="business-profile" @submit.prevent="save">
      <UFormField label="Business name"><UInput v-model="draft.name" required maxlength="120" /></UFormField>
      <UFormField label="Description"><UTextarea v-model="draft.description" maxlength="2000" /></UFormField>
      <UFormField label="Email"><UInput v-model="draft.email" type="email" /></UFormField>
      <UFormField label="Phone"><UInput v-model="draft.phone" type="tel" /></UFormField>
      <UFormField label="Website"><UInput v-model="draft.website" type="url" /></UFormField>
      <div>
        <p>Linked locations</p>
        <div v-for="id in draft.place_ids" :key="id"><NuxtLink :to="`/places/${encodeURIComponent(id)}`">{{ id }}</NuxtLink> <UButton label="Remove location" variant="ghost" color="neutral" @click="draft.place_ids = draft.place_ids.filter((value) => value !== id)" /></div>
        <PlaceSearch @confirmed="linkPlace" />
      </div>
      <UButton type="submit" label="Save profile" :loading="busy" :disabled="busy" />
      <p v-if="message" role="status">{{ message }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { onScopeDispose, reactive, ref } from 'vue'
import type { Business } from '../../models/business.model'
import { useBusinessWorkspace } from '../../composables/useBusinessWorkspace'
const props = defineProps<{ business: Business }>()
const workspace = useBusinessWorkspace()
const draft = reactive({ name: props.business.name, description: props.business.description, email: props.business.email, phone: props.business.phone, website: props.business.website, place_ids: [...props.business.place_ids] })
const busy = ref(false), error = ref(''), message = ref('')
let active = true
onScopeDispose(() => { active = false })
function linkPlace({ placeId }: { placeId: string }) {
  if (!draft.place_ids.includes(placeId) && draft.place_ids.length < 20) draft.place_ids.push(placeId)
}
async function save() {
  if (busy.value) return
  busy.value = true; error.value = ''; message.value = ''
  try {
    const result = await workspace.command('PATCH', { id: props.business.id, profile: { ...draft, place_ids: [...draft.place_ids] } }, () => active)
    if (active && result.current) message.value = 'Business profile saved.'
  } catch (cause) { if (active) error.value = cause instanceof Error ? cause.message : 'Profile could not be saved.' }
  finally { if (active) busy.value = false }
}
</script>
<style scoped>
.business-profile { display: grid; gap: var(--space-4, 1rem); }
</style>
