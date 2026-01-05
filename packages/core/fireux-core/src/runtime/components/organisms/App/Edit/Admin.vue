<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6 min-w-0">

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">locked app config</h3>
            </div>

            <div v-if="isDev" class="shrink-0">
              <UButton
                to="/dashboard/developer"
                size="xs"
                variant="soft"
                icon="i-lucide-arrow-up-right"
                label="Go to dev panel"
              />
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
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="App name"
            :firebase-value="app.app_name"
            placeholder="FireUX"
            :maxlength="60"
            :update-function="noopUpdate"
            disabled
          />
        </div>

        <div class="fx-section__item">
          <MoleculesFormsFirestoreSimpleField
            label="Short name"
            :firebase-value="app.app_short_name"
            placeholder="fireux"
            :maxlength="40"
            :update-function="noopUpdate"
            disabled
          />
        </div>

      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">About</h3>
              <p class="text-xs text-dimmed">
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
              <h3 class="text-base font-semibold">Surfaces</h3>
              <p class="text-xs text-dimmed">
                Card surfaces derived from the app model.
              </p>
            </div>
          </div>
        </template>

        <div v-if="appCard" class="fx-section__item space-y-4">
          <div>
            <div class="mb-2">
              <UBadge size="xs" variant="soft" color="neutral">Cell</UBadge>
            </div>
            <OrganismsAppCardsCell v-bind="appCard" />
          </div>

          <div>
            <div class="mb-2">
              <UBadge size="xs" variant="soft" color="neutral">Preview</UBadge>
            </div>
            <OrganismsAppCardsPreview v-bind="appCard" />
          </div>
        </div>

        <p v-else class="fx-section__empty">No app card available.</p>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h3 class="text-base font-semibold">Social</h3>
              <p class="text-xs text-dimmed">
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
              <h3 class="text-base font-semibold">Admins</h3>
              <p class="text-xs text-dimmed">App administrators.</p>
            </div>
          </div>
        </template>

        <div v-if="adminRows.length" class="fx-section__item space-y-2">
          <ul class="space-y-2">
            <li
              v-for="admin in adminRows"
              :key="admin.id"
              class="flex items-center justify-between gap-3"
            >
              <OrganismsUserCardsPill
                v-bind="adminPillFor(admin)"
                class="min-w-0"
              />

              <UButton
                size="xs"
                variant="soft"
                class="shrink-0"
                :loading="adminActionUid === admin.id"
                :disabled="adminActionUid !== null"
                @click="removeAdmin(admin.id)"
              >
                Remove admin
              </UButton>
            </li>
          </ul>
        </div>
        <p v-else class="fx-section__empty">No admins yet.</p>
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
import type { App } from '../../../../models/core/app.model'
import type { User } from '../../../../models/core/user.model'
import { useAppUpdate } from '../../../../composables/fireux/firestore/core/app/mutations/useAppUpdate'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useAppUsers } from '../../../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useAppJoinRequests } from '../../../../composables/fireux/firestore/core/app/utils/useAppJoinRequests'
import { useUser } from '../../../../composables/fireux/firestore/core/user/useUser'
import { useUserCollection } from '../../../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { useUserFetch } from '../../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useToastify } from '../../../../composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'

const props = withDefaults(defineProps<{ app?: App | null }>(), { app: null })

const appRef = computed(() => props.app)
const app = appRef

const toast = useToastify()

const isDev = computed(() => import.meta.dev)

const { ecosystem } = useFireUXConfig()

const noopUpdate = async () => {}

const {
  updateDescription,
  updateTagline,
  updateShortBio,
  updateLongBio,
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

const adminActionUid = ref<string | null>(null)

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

const adminRows = computed(() => teamRows.value.filter((row) => row.role === 'admin'))

const adminPillFor = (row: {
  id: string
  role: 'admin' | 'user'
  display_name: string
  email: string | null
}) => {
  const hydrated = hydratedUsers.value.find((u) => u.id === row.id)
  const fallbackUser = {
    id: row.id,
    display_name: row.display_name,
    avatar: '',
    handle: '',
    email: row.email ?? '',
    bio: '',
    profiles: [],
  } as unknown as User

  const payload = cardRef.value(hydrated ?? fallbackUser)
  return payload ?? {
    id: row.id,
    to: row.id ? `/users/${row.id}` : '',
    avatar: '',
    title: row.display_name || row.id,
    subtitle: '',
    badges: [],
    line1: '',
    line2: '',
    line3: '',
  }
}

const removeAdmin = withToast(
  async (uid: string) => {
    adminActionUid.value = uid
    try {
      await setAppUserAdmin(uid, false)
    } finally {
      adminActionUid.value = null
    }
  },
  'Removed admin',
  'Failed to remove admin'
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
