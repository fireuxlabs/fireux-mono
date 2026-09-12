<!-- Concurrent edit — 2026-07-21 16:25 CEST — Dashboard Admin pass: make App context explicit and preserve truthful people outcomes. -->
<template>
  <div class="space-y-6">
    <AppEditSectionsAbout :app="app" />

    <AppEditSectionsSocial :app="app" />

    <section class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-highlighted">
            App users and access
          </h3>
          <p class="mt-1 text-sm text-muted">
            Review requests and manage AppUsers and their access to this App.
          </p>
        </div>

        <div
          v-if="appUsersOutcome === 'ready' || appUsersOutcome === 'empty'"
          class="flex flex-wrap gap-2"
        >
          <UBadge color="neutral" variant="soft">
            {{ appUserCount }}
            {{ appUserCount === 1 ? 'AppUser' : 'AppUsers'
            }}{{ membersHasMore ? ' loaded' : '' }}
          </UBadge>
          <UBadge
            :color="joinRequestItems.length ? 'warning' : 'neutral'"
            variant="soft"
          >
            {{ joinRequestItems.length }} pending{{
              requestsHasMore ? ' loaded' : ''
            }}
          </UBadge>
        </div>
      </div>

      <MoleculesStateCard
        v-if="appUsersOutcome === 'idle' || appUsersOutcome === 'pending'"
        entity="AppUsers"
        kind="collection"
        loading
      />

      <MoleculesStateCard
        v-else-if="appUsersOutcome === 'error'"
        entity="AppUsers"
        kind="collection"
        state="error"
      />

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <AppEditSectionsJoinRequests
          :items="joinRequestItems"
          :has-more="requestsHasMore"
          @load-more="loadMoreRequests"
          :on-approve="onApprove"
          :on-remove="onRemove"
        />

        <AppEditSectionsAdmins
          :rows="adminRows"
          :has-more="adminsHasMore"
          @load-more="loadMoreAdmins"
          :action-uid="adminActionUid"
          :pill-for="adminPillFor"
          :on-remove-admin="removeAdmin"
        />

        <AppEditSectionsAppUsers
          :rows="appUserRows"
          :has-more="membersHasMore"
          @load-more="loadMoreMembers"
          :subscription-action-uid="subscriptionActionUid"
          :pill-for="adminPillFor"
          :on-set-subscription="setMemberSubscription"
          class="lg:col-span-2"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: consume bounded App-admin member and join-request identities.
import { computed, ref } from 'vue'
import { useToastify } from '../../../composables/ui/useToastify'
import { runAppUserCommand } from '../../composables/runAppUserCommand'
import { useAppJoinRequests } from '../../composables/firestore/utils/useAppJoinRequests'
import { useAppUsers } from '../../../app/composables/useAppUsers'
import {
  useUserView,
  type UserCard,
} from '../../../user/composables/useUserView'
import type { App } from '../../models/app.model.ts'
import type { AppUserSubscription } from '../../models/app-user.model.ts'
import type { UserIdentitySummary } from '../../../user/models/user-directory.model.ts'

const props = defineProps<{ app: App }>()
const app = computed(() => props.app)

const toast = useToastify()

const handleJoinRequests = (userId: string, approve: boolean) =>
  runAppUserCommand({ action: 'review-join', userId, approve })
const setAppUserAdmin = (userId: string, makeAdmin: boolean) =>
  runAppUserCommand({
    action: 'set-role',
    userId,
    role: makeAdmin ? 'admin' : 'user',
  })
const setAppUserSubscription = (
  userId: string,
  subscription: AppUserSubscription
) => runAppUserCommand({ action: 'set-subscription', userId, subscription })
const {
  memberships: users,
  administrators,
  userById,
  joinRequests,
  count: appUserCount,
  outcome: appUsersOutcome,
  membersHasMore,
  loadMoreMembers,
  adminsHasMore,
  loadMoreAdmins,
  requestsHasMore,
  loadMoreRequests,
} = useAppUsers()
const { pill: userCard } = useUserView()

const withToast =
  <T,>(operation: (value: T) => Promise<unknown>, ok: string, fail: string) =>
  async (value: T) => {
    try {
      await operation(value)
      toast.success(ok)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.'
      toast.error(`${fail}: ${message}`)
      throw error
    }
  }

const adminActionUid = ref<string | null>(null)
const subscriptionActionUid = ref<string | null>(null)

const appUserRows = computed(() => {
  return (users.value ?? [])
    .map((appUser) => {
      const id = (appUser?.id ?? '').trim()
      if (!id) return null
      const hydrated = appUser.user
      return {
        id,
        role:
          appUser?.role === 'admin' || appUser?.role === 'dev'
            ? appUser.role
            : 'user',
        subscription: appUser?.subscription ?? 'free',
        display_name: hydrated?.display_name ?? id,
      }
    })
    .filter(
      (
        row
      ): row is {
        id: string
        role: 'admin' | 'user' | 'dev'
        subscription: 'free' | 'premium' | 'business'
        display_name: string
      } => Boolean(row)
    )
})

const adminRows = computed(() =>
  administrators.value.map((member) => ({
    id: member.id,
    role: member.role,
    subscription: member.subscription,
    display_name: member.user?.display_name || member.id,
  }))
)

const fallbackUserCard = (options: {
  id: string
  displayName: string
  handle?: string
}): UserCard => {
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
  target?: UserIdentitySummary | null | undefined
): UserCard => {
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
  role: 'admin' | 'user' | 'dev'
  display_name: string
}) => {
  const user = userById(row.id)
  if (user) return cardForUser(user)

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

const setMemberSubscription = withToast(
  async (value: {
    uid: string
    subscription: 'free' | 'premium' | 'business'
  }) => {
    subscriptionActionUid.value = value.uid
    try {
      await setAppUserSubscription(value.uid, value.subscription)
    } finally {
      subscriptionActionUid.value = null
    }
  },
  'Subscription updated',
  'Failed to update subscription'
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
