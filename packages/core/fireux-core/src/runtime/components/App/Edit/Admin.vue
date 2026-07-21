<!-- Concurrent edit — 2026-07-21 16:25 CEST — Dashboard Admin pass: make App context explicit and preserve truthful people outcomes. -->
<template>
  <div class="space-y-6">
    <AppEditSectionsAbout
      :app="app"
      :handle-tagline-update="handleTaglineUpdate"
      :handle-description-update="handleDescriptionUpdate"
      :handle-short-bio-update="handleShortBioUpdate"
      :handle-long-bio-update="handleLongBioUpdate"
    />

    <AppEditSectionsSocial
      :app="app"
      :handle-update-social-links="handleUpdateSocialLinks"
    />

    <section class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-highlighted">
            People and access
          </h3>
          <p class="mt-1 text-sm text-muted">
            Review requests and see who can use or administer this app.
          </p>
        </div>

        <div
          v-if="peopleOutcome === 'ready' || peopleOutcome === 'empty'"
          class="flex flex-wrap gap-2"
        >
          <UBadge color="neutral" variant="soft">
            {{ membershipCount }} {{ membershipCount === 1 ? 'member' : 'members' }}
          </UBadge>
          <UBadge
            :color="joinRequestItems.length ? 'warning' : 'neutral'"
            variant="soft"
          >
            {{ joinRequestItems.length }} pending
          </UBadge>
        </div>
      </div>

      <UAlert
        v-if="peopleTruncated"
        color="warning"
        variant="soft"
        icon="i-lucide-list-end"
        title="Showing the first 100 records"
        description="Member or join-request results reached the bounded limit."
      />

      <MoleculesStateCard
        v-if="peopleOutcome === 'idle' || peopleOutcome === 'pending'"
        entity="app people"
        kind="collection"
        loading
      />

      <MoleculesStateCard
        v-else-if="peopleOutcome === 'error'"
        entity="app people"
        kind="collection"
        state="error"
      />

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <AppEditSectionsJoinRequests
          :items="joinRequestItems"
          :on-approve="onApprove"
          :on-remove="onRemove"
        />

        <AppEditSectionsAdmins
          :rows="adminRows"
          :action-uid="adminActionUid"
          :pill-for="adminPillFor"
          :on-remove-admin="removeAdmin"
        />

        <AppEditSectionsMembers
          :rows="teamRows"
          :pill-for="adminPillFor"
          class="lg:col-span-2"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: consume bounded App-admin member and join-request identities.
import { computed, ref } from 'vue'
import { useToastify } from '../../../composables/fireux/app/ui/useToastify'
import { useAppUpdate } from '../../../composables/fireux/firestore/core/app/mutations/useAppUpdate'
import { useAppJoinRequests } from '../../../composables/fireux/firestore/core/app/utils/useAppJoinRequests'
import { useAppUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useAppUserCollection'
import { useUserInterface, type UserCard } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { AppModel } from '../../../models/core/app.model'
import type { PublicUserIdentityDto } from '../../../server/utils/public-projection/public-dto.types'

const props = defineProps<{ app: AppModel }>()
const appRef = computed(() => props.app)
const app = computed(() => props.app)

const toast = useToastify()

const {
  updateDescription,
  updateTagline,
  updateShortBio,
  updateLongBio,
  updateSocialLinks,
  handleJoinRequests,
  setAppUserAdmin,
} = useAppUpdate(appRef)
const {
  memberships: users,
  fulfilled: hydratedUsers,
  joinRequests,
  count: membershipCount,
  outcome: peopleOutcome,
  truncated: peopleTruncated,
  refresh: refreshPeople,
} = useAppUserCollection()
const { pill: userCard } = useUserInterface()

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
      }
    })
    .filter(
      (row): row is {
        id: string
        role: 'admin' | 'user'
        display_name: string
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
    to: handle ? `/users/${encodeURIComponent(handle)}` : '',

    imageUrl: '',
    avatarUrl: '',
    secondaryAvatarUrl: '',
    displayName,
    title: '',
    subtitle: '',
    summary: '',

    handle: handle ? `@${handle}` : '',
    badges: [],
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',

    bio: '',
    profiles: [],
    appsLabel: '',
  }
}

const cardForUser = (
  target?: PublicUserIdentityDto | null | undefined
): UserCard.Card => {
  const payload = userCard(target ?? undefined)
  if (payload) return payload

  const id = (target?.id ?? '').trim()
  const displayName = (target?.display_name ?? id).trim() || 'Unknown user'
  const handle = (target?.handle ?? '').trim()

  return {
    ...fallbackUserCard({ id, displayName, handle }),
    avatarUrl: target?.avatar ?? '',
    imageUrl: target?.avatar ?? '',
    title: '',
    summary: '',
    bio: '',
    profiles: [],
    appsLabel: '',
  }
}

const adminPillFor = (row: {
  id: string
  role: 'admin' | 'user'
  display_name: string
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
      await refreshPeople()
    } finally {
      adminActionUid.value = null
    }
  },
  'Removed admin',
  'Failed to remove admin'
)

const cardRef = computed(() => cardForUser)

const {
  items: joinRequestItems,
  approve: approveJoinRequest,
  reject: rejectJoinRequest,
} = useAppJoinRequests({
  requests: joinRequests,
  handleJoinRequests,
  card: cardRef,
  refresh: refreshPeople,
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
