<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6">

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Locked</h3>
              <p class="text-xs text-gray-500">
                Values seeded by config and not editable here.
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
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Editable</h3>
              <p class="text-xs text-gray-500">Fields used by app cards across the UI.</p>
            </div>
          </div>
        </template>

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
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Surfaces</h3>
              <p class="text-xs text-gray-500">
                Pill, cell, preview, and profile views derived from the app model.
              </p>
            </div>
          </div>
        </template>

        <div v-if="appCard" class="fx-section__item space-y-4">
          <div>
            <div class="mb-2 text-xs text-gray-500">Pill</div>
            <OrganismsAppCardsPill v-bind="appCard" />
          </div>

          <div>
            <div class="mb-2 text-xs text-gray-500">Cell</div>
            <OrganismsAppCardsCell v-bind="appCard" />
          </div>

          <div>
            <div class="mb-2 text-xs text-gray-500">Preview</div>
            <OrganismsAppCardsPreview v-bind="appCard" />
          </div>

          <div>
            <div class="mb-2 text-xs text-gray-500">Profile</div>
            <OrganismsAppCardsProfile v-bind="appCard" :app="app" />
          </div>
        </div>

        <p v-else class="fx-section__empty">No app card available.</p>
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
            label="Tagline"
            :maxlength="120"
            :firebase-value="app.tagline"
            placeholder="A short one-liner for cards and lists"
            :update-function="handleTaglineUpdate"
          />
        </div>

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

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Short bio"
            type="textarea"
            :rows="2"
            :maxlength="240"
            :firebase-value="app.short_bio"
            placeholder="Short bio used on compact surfaces"
            :update-function="handleShortBioUpdate"
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Long bio"
            type="textarea"
            :rows="6"
            :maxlength="4000"
            :firebase-value="app.long_bio"
            placeholder="Long bio for profile pages"
            :update-function="handleLongBioUpdate"
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
                Search members and grant additional admins.
              </p>
            </div>
          </div>
        </template>

        <div v-if="teamRows.length" class="fx-section__item space-y-3">
          <UInput
            v-model="teamSearch"
            placeholder="Search by name, email, or uid"
          />

          <ul class="divide-y divide-gray-100">
            <li
              v-for="member in filteredTeamRows"
              :key="member.id"
              class="flex items-center justify-between gap-3 py-2"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-gray-900">
                  {{ member.display_name }}
                </p>
                <p class="truncate font-mono text-[0.75rem] text-gray-500">
                  {{ member.id }}
                  <span v-if="member.email">· {{ member.email }}</span>
                </p>
              </div>

              <div class="flex items-center gap-2">
                <UBadge size="sm" variant="soft">
                  {{ member.role === 'admin' ? 'Admin' : 'Member' }}
                </UBadge>
                <UButton
                  size="xs"
                  :loading="grantingAdminUid === member.id"
                  :disabled="member.role === 'admin' || grantingAdminUid !== null"
                  @click="grantAdmin(member.id)"
                >
                  Make admin
                </UButton>
              </div>
            </li>
          </ul>

          <p v-if="!filteredTeamRows.length" class="text-sm text-gray-500">
            No matches.
          </p>
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
import { useAppInterface } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useAppUsers } from '../../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useAppJoinRequests } from '../../../composables/fireux/firestore/core/app/utils/useAppJoinRequests'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useUserCollection'
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
  updateTagline,
  updateShortBio,
  updateLongBio,
  updateAppName,
  updateAppShortName,
  updateEcosystem,
  updateInstagram,
  handleJoinRequests,
  setAppUserAdmin,
} = useAppUpdate(appRef)
const { users } = useAppUsers()
const { fulfilled: hydratedUsers } = useUserCollection()
const { card } = useUser()

const appInterface = useAppInterface(appRef)
const appCard = computed(() => appInterface.card())

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

const handleTaglineUpdate = withToast(
  updateTagline,
  'Tagline updated',
  'Failed to update tagline'
)

const handleShortBioUpdate = withToast(
  updateShortBio,
  'Short bio updated',
  'Failed to update short bio'
)

const handleLongBioUpdate = withToast(
  updateLongBio,
  'Long bio updated',
  'Failed to update long bio'
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

const handleUpdateInstagram = withToast(
  updateInstagram,
  'Instagram link saved',
  'Failed to update Instagram link'
)

const teamSearch = ref('')
const grantingAdminUid = ref<string | null>(null)

const teamRows = computed(() => {
  const byId = new Map(hydratedUsers.value.map((u) => [u.id, u]))
  return (users.value ?? [])
    .map((appUser) => {
      const id = (appUser?.id ?? '').trim()
      if (!id) return null
      const hydrated = byId.get(id)
      return {
        id,
        role: appUser?.role === 'admin' ? 'admin' : 'user',
        display_name: hydrated?.display_name ?? id,
        email: hydrated?.email ?? null,
      }
    })
    .filter(
      (row): row is {
        id: string
        role: 'admin' | 'user'
        display_name: string
        email: string | null
      } => Boolean(row)
    )
})

const filteredTeamRows = computed(() => {
  const q = teamSearch.value.trim().toLowerCase()
  if (!q) return teamRows.value

  return teamRows.value.filter((row) => {
    const haystack = `${row.display_name} ${row.email ?? ''} ${row.id}`
      .toLowerCase()
      .trim()
    return haystack.includes(q)
  })
})

const grantAdmin = withToast(
  async (uid: string) => {
    grantingAdminUid.value = uid
    try {
      await setAppUserAdmin(uid, true)
    } finally {
      grantingAdminUid.value = null
    }
  },
  'Granted admin',
  'Failed to grant admin'
)

const fetchedUser = (uid: string) => {
  const { coreUser } = useUserFetch(uid)
  return { user: computed(() => coreUser.value ?? null) }
}

const cardRef = computed(() => (target?: User | null | undefined) => {
  const payload = card(target ?? undefined)
  if (payload) return payload
  const uid = target?.id ?? ''
  return {
    id: uid,
    to: uid ? `/users/${uid}` : '',
    avatar: '',
    title: uid || 'Unknown user',
    subtitle: '',
    badges: [],
    line1: '',
    line2: '',
    line3: '',
  }
})

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
