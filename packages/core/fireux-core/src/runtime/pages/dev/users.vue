<template>
  <div>
    <!-- Summary -->
    <UCard>
      <template #header>
        <h1>👥 Users (Dev)</h1>
      </template>

      <div class="grid" style="display: grid; gap: 12px; grid-template-columns: 1fr;">
        <div>
          <h2>Status</h2>
          <ul>
            <li>hasCoreProfile: {{ hasCoreProfile }}</li>
            <li v-if="hasAppProfile !== undefined">hasAppProfile: {{ hasAppProfile }}</li>
            <li>isAdmin: {{ isAdmin }}</li>
            <li>displayName: {{ displayName || '—' }}</li>
            <li>initials: {{ initials || '—' }}</li>
          </ul>
        </div>

        <USeparator />

        <!-- Actions -->
        <div>
          <h2>Actions</h2>
          <div class="actions" style="display:flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <UButton :disabled="!hasUser" @click="onEnsure">Ensure User</UButton>

            <div style="display:flex; gap: 8px; align-items: center;">
              <UInput v-model="displayNameInput" :disabled="!hasUser" placeholder="New display name" style="width: 220px" />
              <UButton :disabled="!hasUser || !displayNameInput" variant="outline" @click="onSaveDisplayName">Save Name</UButton>
            </div>

            <div style="display:flex; gap: 8px; align-items: center;">
              <input ref="fileEl" type="file" accept="image/*" :disabled="!hasUser" @change="onPickAvatar" />
              <UButton :disabled="!hasUser" variant="ghost" @click="resetFile">Reset File</UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Current user JSON -->
    <UCard style="margin-top: 16px">
      <DevJson :data="user?.value ?? null" title="Current User" :defaultOpen="true" />
    </UCard>

    <!-- Collections overview -->
    <div style="margin-top: 16px; display: grid; gap: 16px; grid-template-columns: 1fr;">
      <UCard>
        <template #header>
          <h2>Local Collection (apps/{appId}/users)</h2>
        </template>
        <p>Total: {{ localCount }}</p>
        <DevJson :data="localFirst" title="First Local (up to 5)" />
      </UCard>

      <UCard>
        <template #header>
          <h2>Global Collection (core-users)</h2>
        </template>
        <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 8px;">
          <p style="margin: 0;">Total: {{ globalCount }}</p>
          <UButton size="sm" variant="outline" @click="ensureGlobalLoaded">Load/Refresh</UButton>
        </div>
        <DevJson :data="globalFirst" title="First Global (up to 5)" />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Users',
  layout: 'dev',
})

import { ref, computed, onMounted } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'

// Unified user API
const {
  user,
  collection,
  hasCoreProfile,
  hasAppProfile,
  isAdmin,
  displayName,
  initials,
  // actions
  ensureUser,
  updateDisplayName,
  updateAvatar,
} = useUser()

const hasUser = computed(() => !!user.value?.id)

// Display name editing
const displayNameInput = ref<string>('')
watchEffect(() => {
  displayNameInput.value = displayName?.value || ''
})

async function onEnsure() {
  try {
    await ensureUser?.()
  } catch (e) {
    console.error('[dev/users] ensureUser failed', e)
  }
}

async function onSaveDisplayName() {
  if (!displayNameInput.value) return
  try {
    await updateDisplayName?.(displayNameInput.value)
  } catch (e) {
    console.error('[dev/users] updateDisplayName failed', e)
  }
}

// Avatar upload
const fileEl = ref<HTMLInputElement | null>(null)
function resetFile() {
  if (fileEl.value) fileEl.value.value = ''
}
async function onPickAvatar(evt: Event) {
  const input = evt.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await updateAvatar?.(file)
  } catch (e) {
    console.error('[dev/users] updateAvatar failed', e)
  } finally {
    // keep file for repeat if desired
  }
}

// Collections
const localCount = computed(() => collection.local?.value?.length ?? 0)
const globalCount = computed(() => collection.global?.value?.length ?? 0)

const localFirst = computed(() => (collection.local?.value ?? []).slice(0, 5))
const globalFirst = computed(() => (collection.global?.value ?? []).slice(0, 5))

function ensureGlobalLoaded() {
  // For tenant apps, global is lazy. Call fetchGlobal() to init.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(collection as any)?.fetchGlobal?.()
}

onMounted(() => {
  ensureGlobalLoaded()
})
</script>

<style scoped>
/* Keep styling minimal; rely on UCard + DevJson */
</style>