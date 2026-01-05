<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6 min-w-0">

      <OrganismsAppEditSectionsLockedConfig
        :app="app"
        :is-dev="isDev"
        :noop-update="noopUpdate"
        :handle-ecosystem-update="handleEcosystemUpdate"
      />

      <OrganismsAppEditSectionsAbout
        :app="app"
        :handle-tagline-update="handleTaglineUpdate"
        :handle-description-update="handleDescriptionUpdate"
        :handle-short-bio-update="handleShortBioUpdate"
        :handle-long-bio-update="handleLongBioUpdate"
      />

      <OrganismsAppEditSectionsSurfaces :app-card="appCard" />

      <OrganismsAppEditSectionsSocial
        :app="app"
        :handle-update-social-links="handleUpdateSocialLinks"
      />

      <OrganismsAppEditSectionsJoinRequests
        :items="joinRequestItems"
        :on-approve="onApprove"
        :on-remove="onRemove"
      />

      <OrganismsAppEditSectionsAdmins
        :rows="adminRows"
        :action-uid="adminActionUid"
        :pill-for="adminPillFor"
        :on-remove-admin="removeAdmin"
      />

      <OrganismsAppEditSectionsTenantOverrides />
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

const props = withDefaults(defineProps<{ app?: App | null }>(), { app: null })

const appRef = computed(() => props.app)
const app = appRef

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

  const payload = cardRef.value(hydrated?.coreUser ?? fallbackUser)
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
