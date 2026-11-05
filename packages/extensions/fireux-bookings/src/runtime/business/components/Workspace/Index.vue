<template>
  <section class="bookings-workspace">
    <UFormField label="Business"><USelect v-model="selectedId" :items="choices" placeholder="Choose a business" /></UFormField>
    <UButton to="/workspace/business" label="Business profile and Team" variant="link" />
    <p v-if="!selectedId">Choose or create a Business to manage its bookings.</p>
    <UAlert v-if="error" color="error" title="Bookings could not be loaded" :description="error.message" />
    <UButton v-if="selectedId" label="Refresh" color="neutral" variant="soft" :loading="pending" @click="refresh()" />
    <p v-if="notice" role="status">{{ notice }}</p>
    <template v-if="current">
      <BookingsWorkspaceAvailability :key="`${selectedId}-${current.availability.revision}`" :business-id="selectedId" :availability="current.availability" @saved="saved" />
      <BookingsWorkspaceList :bookings="current.bookings" />
      <div>
        <UButton v-if="cursor" label="First page" variant="soft" @click="cursor = ''" />
        <UButton v-if="current.nextCursor" label="Next page" variant="soft" @click="cursor = current.nextCursor" />
      </div>
    </template>
    <p v-else-if="pending" role="status">Loading bookings…</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { useBusinessWorkspace } from 'fireux-businesses/runtime/business/composables/useBusinessWorkspace'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { BookingAvailability, BusinessBooking } from '../../../models/business-bookings'
const workspace = useBusinessWorkspace()
const appSession = useAppSession()
const { currentUser } = useAuth()
const selectedId = workspace.id
const choices = computed(() => workspace.collection.value.map((business) => ({ label: business.name, value: business.id })))
const cursor = ref(''), notice = ref('')
watch(selectedId, () => { cursor.value = ''; notice.value = '' }, { flush: 'sync' })
const capture = useCommandScope([currentUser, selectedId, appSession.appUser])
const { data, pending, error, refresh } = useAsyncData(
  () => `business-bookings|${currentUser.value?.uid}|${selectedId.value}|${cursor.value}`,
  async (_app, { signal }) => {
    const user = currentUser.value, id = selectedId.value, pageCursor = cursor.value, isCurrent = capture()
    if (!user || !id || workspace.selected.value?.id !== id) return null
    const token = await user.getIdToken()
    if (!isCurrent()) throw new Error('Business or account changed.')
    return $fetch<{ businessId: string; availability: BookingAvailability; bookings: BusinessBooking[]; nextCursor: string }>('/api/workspace/business/bookings', {
      signal, cache: 'no-store', query: { businessId: id, cursor: pageCursor }, headers: { authorization: `Bearer ${token}` },
    })
  }, { server: false, watch: [selectedId, currentUser, cursor, workspace.outcome, appSession.appUser] }
)
function saved() { notice.value = 'Availability saved.'; void refresh() }
const current = computed(() => workspace.outcome.value === 'ready' && workspace.selected.value?.id === selectedId.value && !pending.value && !error.value && data.value?.businessId === selectedId.value ? data.value : null)
</script>
<style scoped>
.bookings-workspace { display: grid; gap: var(--space-4, 1rem); }
</style>
