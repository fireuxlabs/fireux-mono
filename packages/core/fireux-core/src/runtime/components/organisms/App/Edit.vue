<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6">
      <!-- Images -->
      <UCard>
        <div class="flex flex-col items-center gap-2">
          <UAvatar
            :src="avatarSrc"
            :alt="app.app_name || app.id || 'App'"
            :text="avatarInitials"
            size="3xl"
          />

          <div class="flex flex-wrap items-center justify-center gap-2">
            <UButton
              size="sm"
              variant="soft"
              icon="i-lucide-refresh-cw"
              :loading="imageRefreshing === 'avatar'"
              :disabled="Boolean(imageRefreshing)"
              label="Refresh avatar from bucket"
              @click="refreshAvatar"
            />

            <UButton
              size="sm"
              variant="soft"
              icon="i-lucide-refresh-cw"
              :loading="imageRefreshing === 'logo'"
              :disabled="Boolean(imageRefreshing)"
              label="Refresh logo from bucket"
              @click="refreshLogo"
            />

            <UButton
              size="sm"
              variant="soft"
              icon="i-lucide-refresh-cw"
              :loading="imageRefreshing === 'wordmark'"
              :disabled="Boolean(imageRefreshing)"
              label="Refresh wordmark from bucket"
              @click="refreshWordmark"
            />
          </div>

          <p class="text-xs text-gray-500">
            Update the image in the public bucket, then refresh here.
          </p>
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Identity</h3>
              <p class="text-xs text-gray-500">
                Fields used by app cards across the UI.
              </p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="App ID"
            :firebase-value="app.id"
            placeholder="app-id"
            :maxlength="80"
            :update-function="noopUpdate"
            disabled
            :disabled-message="lockedMessage"
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="App name"
            :firebase-value="app.app_name"
            placeholder="FireUX"
            :maxlength="60"
            :update-function="handleAppNameUpdate"
            :disabled="lockedIdentity"
            :disabled-message="lockedMessage"
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Short name"
            :firebase-value="app.app_short_name"
            placeholder="fireux"
            :maxlength="40"
            :update-function="handleAppShortNameUpdate"
            :disabled="lockedIdentity"
            :disabled-message="lockedMessage"
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Role"
            :firebase-value="app.role"
            placeholder="global"
            :maxlength="20"
            :update-function="noopUpdate"
            disabled
            :disabled-message="lockedMessage"
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Ecosystem"
            :firebase-value="app.ecosystem"
            placeholder="misebox"
            :maxlength="60"
            :update-function="handleEcosystemUpdate"
            disabled
            :disabled-message="lockedMessage"
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Status"
            :firebase-value="app.status"
            placeholder="active"
            :maxlength="12"
            :update-function="handleStatusUpdate"
          />
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">About</h3>
              <p class="text-xs text-gray-500">
                Keep the human-facing description up to date.
              </p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Description"
            type="textarea"
            :rows="3"
            :maxlength="500"
            :firebase-value="app.description"
            placeholder="Describe your application..."
            :update-function="handleDescriptionUpdate"
          />
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Social</h3>
              <p class="text-xs text-gray-500">
                Link tenant-visible marketing or support channels.
              </p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Instagram"
            type="url"
            :firebase-value="app.social_links?.instagram"
            placeholder="https://instagram.com/your-app"
            :update-function="handleUpdateInstagram"
          />
        </div>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Join Requests</h3>
              <p class="text-xs text-gray-500">
                Approve to add new members or clear pending invites.
              </p>
            </div>
          </div>
        </template>

        <div v-if="joinRequestItems.length" class="fx-section__item">
          <MoleculesFormsFirestoreListActions
            :items="joinRequestItems"
            :action-approve="onApprove"
            :action-reject="onRemove"
            approve-label="Approve"
            reject-label="Remove"
          />
        </div>
        <p v-else class="fx-section__empty">No pending requests.</p>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Team</h3>
              <p class="text-xs text-gray-500">
                Current tenant member document identifiers.
              </p>
            </div>
          </div>
        </template>

        <div v-if="teamIds.length" class="fx-section__item">
          <ul class="fx-section__grid font-mono text-[0.75rem]">
            <li v-for="id in teamIds" :key="id">{{ id }}</li>
          </ul>
        </div>
        <p v-else class="fx-section__empty">No members yet.</p>
      </UCard>

      <UCard>
        <div class="fx-app-slot">
          <p class="fx-app-slot__label">Tenant overrides</p>
          <p class="fx-app-slot__copy">
            This surface is reserved for per-tenant deltas once app-level
            controls are defined.
          </p>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="app settings" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { App } from '../../../models/core/app.model'
import type { User } from '../../../models/core/user.model'
import { useAppUpdate } from '../../../composables/fireux/firestore/core/app/mutations/useAppUpdate'
import { useAppUsers } from '../../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useAppJoinRequests } from '../../../composables/fireux/firestore/core/app/utils/useAppJoinRequests'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useUserFetch } from '../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useToastify } from '../../../composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'

const props = withDefaults(defineProps<{ app?: App | null }>(), { app: null })

const appRef = computed(() => props.app)
const app = appRef

const toast = useToastify()

const { ecosystem } = useFireUXConfig()
const lockedMessage = computed(() => `Contact your ${ecosystem} dev team.`)

// Developer-owned identity values are seeded from Nuxt config.
// Keep this as a single toggle so it's easy to loosen later.
const lockedIdentity = true

const noopUpdate = async () => {}

const {
  updateDescription,
  updateAppName,
  updateAppShortName,
  updateEcosystem,
  updateStatus,
  updateInstagram,
  refreshImageFromBucket,
  handleJoinRequests,
} = useAppUpdate(appRef)
const { users } = useAppUsers()
const { card } = useUser()

const avatarSrc = computed(
  () =>
    app.value?.avatar_url ||
    app.value?.logo_url ||
    app.value?.wordmark_url ||
    ''
)

const avatarInitials = computed(() => {
  const name = app.value?.app_name || app.value?.id || 'A'
  return name.slice(0, 2).toUpperCase()
})

const withToast =
  <T>(operation: (value: T) => Promise<unknown>, ok: string, fail: string) =>
  async (value: T) => {
    try {
      await operation(value)
      toast.success(ok)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`${fail}: ${message}`)
      throw error
    }
  }

const handleDescriptionUpdate = withToast(
  updateDescription,
  'App description updated',
  'Failed to update description'
)

const handleAppNameUpdate = withToast(
  updateAppName,
  'App name updated',
  'Failed to update app name'
)

const handleAppShortNameUpdate = withToast(
  updateAppShortName,
  'Short name updated',
  'Failed to update short name'
)

const handleEcosystemUpdate = withToast(
  updateEcosystem,
  'Ecosystem updated',
  'Failed to update ecosystem'
)

const handleStatusUpdate = withToast(
  updateStatus,
  'Status updated',
  'Failed to update status'
)

const handleUpdateInstagram = withToast(
  updateInstagram,
  'Instagram link saved',
  'Failed to update Instagram link'
)

type AppImageKind = 'avatar' | 'logo' | 'wordmark'
const imageRefreshing = ref<AppImageKind | null>(null)
const refreshAvatar = async () => {
  imageRefreshing.value = 'avatar'
  try {
    await refreshImageFromBucket('avatar')
    toast.success('Avatar refreshed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to refresh avatar: ${message}`)
    throw error
  } finally {
    imageRefreshing.value = null
  }
}

const refreshLogo = async () => {
  imageRefreshing.value = 'logo'
  try {
    await refreshImageFromBucket('logo')
    toast.success('Logo refreshed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to refresh logo: ${message}`)
    throw error
  } finally {
    imageRefreshing.value = null
  }
}

const refreshWordmark = async () => {
  imageRefreshing.value = 'wordmark'
  try {
    await refreshImageFromBucket('wordmark')
    toast.success('Wordmark refreshed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to refresh wordmark: ${message}`)
    throw error
  } finally {
    imageRefreshing.value = null
  }
}

const fetchedUser = (uid: string) => {
  const { coreUser } = useUserFetch(uid)
  return { user: computed(() => coreUser.value ?? null) }
}

const cardRef = computed(() => (target?: User | null | undefined) => card(target ?? undefined))

const {
  items: joinRequestItems,
  approve: approveJoinRequest,
  reject: rejectJoinRequest,
} = useAppJoinRequests({
  app: appRef,
  handleJoinRequests,
  fetchedUser,
  card: cardRef,
})

const teamIds = computed(() =>
  (users.value ?? [])
    .map((entry) => (entry?.id ?? '').trim())
    .filter((id) => id.length > 0)
)

const onApprove = withToast(
  (uid: string) => approveJoinRequest(uid),
  'Join request approved',
  'Failed to approve request'
)

const onRemove = withToast(
  (uid: string) => rejectJoinRequest(uid),
  'Join request removed',
  'Failed to remove request'
)
</script>

<style scoped>
.fx-app-slot {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fx-app-slot__label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.7);
}

.fx-app-slot__copy {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(15, 23, 42, 0.8);
}
</style>
