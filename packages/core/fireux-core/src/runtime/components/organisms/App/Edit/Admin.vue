<template>
  <template v-if="app">
    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsLockedConfig
        :app="app"
        :is-dev="isDev"
        :noop-update="noopUpdate"
        :handle-ecosystem-update="handleEcosystemUpdate"
      />
    </div>

    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsAbout
        :app="app"
        :handle-tagline-update="handleTaglineUpdate"
        :handle-description-update="handleDescriptionUpdate"
        :handle-short-bio-update="handleShortBioUpdate"
        :handle-long-bio-update="handleLongBioUpdate"
      />
    </div>

    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsSurfaces :app-card="appCard" />
    </div>

    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsSocial
        :app="app"
        :handle-update-social-links="handleUpdateSocialLinks"
      />
    </div>

    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsJoinRequests
        :items="joinRequestItems"
        :on-approve="onApprove"
        :on-remove="onRemove"
      />
    </div>

    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsAdmins
        :rows="adminRows"
        :action-uid="adminActionUid"
        :pill-for="adminPillFor"
        :on-remove-admin="removeAdmin"
      />
    </div>

    <div class="panels-masonry__item dashboard-item mb-10">
      <AppEditSectionsTenantOverrides />
    </div>
  </template>

  <MoleculesStateCard
    v-else-if="pending"
    entity="app settings"
    kind="document"
    loading
  />

  <MoleculesStateCard v-else entity="app settings" kind="document" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from '../../../../composables/fireux/app/ui/useToastify'
import { useAppUsers } from '../../../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useAppUpdate } from '../../../../composables/fireux/firestore/core/app/mutations/useAppUpdate'
import { useApp } from '../../../../composables/fireux/firestore/core/app/useApp'
import { useAppJoinRequests } from '../../../../composables/fireux/firestore/core/app/utils/useAppJoinRequests'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useUserCollection } from '../../../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import { useUserFetch } from '../../../../composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUserInterface, type UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { AppModel } from '../../../../models/core/app.model'
import type { User } from '../../../../models/core/user.model'

const props = withDefaults(
  defineProps<{ app?: AppModel | null }>(),
  { app: null }
)

const { app: internalApp, pending: internalPending } = useApp()

const appRef = computed(() => props.app ?? internalApp.value ?? null)
const app = appRef
const pending = computed(() => (props.app ? false : internalPending.value))

const toast = useToastify()

const isDev = computed(() => import.meta.dev)

const noopUpdate = async () => {}

const {
  updateDescription,
  updateTagline,
  updateShortBio,
  updateLongBio,
  updateEcosystem,
  updateSocialLinks,
  handleJoinRequests,
  setAppUserAdmin,
} = useAppUpdate(appRef)
const { users } = useAppUsers()
const { fulfilled: hydratedUsers } = useUserCollection()
const { card: userCard } = useUserInterface()

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

const handleUpdateSocialLinks = withToast(
  updateSocialLinks,
  'Social links saved',
  'Failed to update social links'
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

const fallbackUserCard = (options: {
  id: string
  displayName: string
  handle?: string
}): UserCard.Card => {
  const id = options.id
  const displayName = options.displayName
  const handle = (options.handle ?? '').trim()

  return {
    id,
    to: id ? `/users/${id}` : '',

    avatarUrl: '',
    displayName,

    handle: handle ? `@${handle}` : '',
    badges: [],

    bio: '',
    profiles: [],
    appsLabel: '',
  }
}

const cardForUser = (target?: User | null | undefined): UserCard.Card => {
  const payload = userCard(target ?? undefined)
  if (payload) return payload

  const id = (target?.id ?? '').trim()
  const displayName = (target?.display_name ?? id).trim() || 'Unknown user'
  const handle = (target?.handle ?? '').trim()

  return {
    ...fallbackUserCard({ id, displayName, handle }),
    avatarUrl: target?.avatar ?? '',
    bio: target?.bio ?? '',
    profiles: target?.profiles ?? [],
    appsLabel: target?.userOf?.length ? `${target.userOf.length} apps` : '',
  }
}

const adminPillFor = (row: {
  id: string
  role: 'admin' | 'user'
  display_name: string
  email: string | null
}) => {
  const hydrated = hydratedUsers.value.find((u) => u.id === row.id)
  if (hydrated?.coreUser) return cardForUser(hydrated.coreUser)

  return fallbackUserCard({
    id: row.id,
    displayName: row.display_name || row.id,
  })
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

const cardRef = computed(() => cardForUser)

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
