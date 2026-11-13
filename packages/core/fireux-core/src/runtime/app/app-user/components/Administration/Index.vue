<template>
  <section>
    <div>
      <div>
        <h3>App users and access</h3>
        <p>Manage the members and access for this App.</p>
      </div>

      <div
        v-if="appUsersOutcome === 'ready' || appUsersOutcome === 'empty'"
        class="fx-card__actions"
      >
        <UBadge color="neutral" variant="soft">
          {{ appUserCount }}
          {{ appUserCount === 1 ? 'AppUser' : 'AppUsers'
          }}{{ membersHasMore ? ' loaded' : '' }}
        </UBadge>
      </div>
    </div>

    <FireState
      v-if="appUsersOutcome === 'idle' || appUsersOutcome === 'pending'"
      entity="AppUsers"
      outcome="pending"
    />

    <FireState
      v-else-if="appUsersOutcome === 'error'"
      entity="AppUsers"
      outcome="error"
    />

    <div v-else>
      <AppUserAdministrationAdmins
        :rows="adminRows"
        :has-more="adminsHasMore"
        @load-more="loadMoreAdmins"
        :action-uid="adminActionUid"
        :pill-for="adminPillFor"
        :on-remove-admin="removeAdmin"
      />

      <AppUserAdministrationMembers
        :rows="appUserRows"
        :has-more="membersHasMore"
        @load-more="loadMoreMembers"
        :role-action-uid="adminActionUid"
        :subscription-action-uid="subscriptionActionUid"
        :pill-for="adminPillFor"
        :on-make-admin="makeMemberAdmin"
        :on-set-subscription="setMemberSubscription"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
// Concurrent edit — 2026-11-03 — App administration manages current members only.
import { computed, ref, watch } from 'vue'
import { useToastify } from '../../../../composables/ui/useToastify'
import { useCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
import { useAppSession } from '../../../composables/useAppSession'
import { runAppUserCommand } from '../../composables/run-app-user-command'
import { useAppUsers } from '../../composables/useAppUsers'
import { useUserView } from '../../../../user/composables/useUserView'
import type { UserPillProps } from '../../../../user/components/Cards/Pill.vue'
import type { AppUserSubscription } from '../../models/model.ts'

const props = defineProps<{ appId: string }>()

const toast = useToastify()
const session = useAppSession()
const actionSources = [
  session.uid,
  session.appUser,
  session.pending,
  session.error,
  () => props.appId,
]
const captureIntent = useCommandScope(actionSources)

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
  count: appUserCount,
  outcome: appUsersOutcome,
  membersHasMore,
  loadMoreMembers,
  adminsHasMore,
  loadMoreAdmins,
} = useAppUsers()
const { toView } = useUserView()

const withToast =
  <T,>(operation: (value: T) => Promise<unknown>, ok: string, fail: string) =>
  async (value: T) => {
    const isCurrent = captureIntent()
    try {
      await operation(value)
      if (isCurrent()) toast.success(ok)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.'
      if (isCurrent()) toast.error(`${fail}: ${message}`)
      throw error
    }
  }

const adminActionUid = ref<string | null>(null)
const subscriptionActionUid = ref<string | null>(null)
watch(
  actionSources,
  () => {
    adminActionUid.value = null
    subscriptionActionUid.value = null
  },
  { flush: 'sync' }
)

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
        subscription: 'free' | 'pro' | 'business'
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

const adminPillFor = (row: {
  id: string
  role: 'admin' | 'user' | 'dev'
  display_name: string
}): UserPillProps => {
  const user = userById(row.id)
  return {
    ...toView(user),
    displayName: user ? user.display_name : row.display_name || row.id,
  }
}

const removeAdmin = withToast(
  async (uid: string) => {
    const isCurrent = captureIntent()
    adminActionUid.value = uid
    try {
      await setAppUserAdmin(uid, false)
    } finally {
      if (isCurrent()) adminActionUid.value = null
    }
  },
  'Removed admin',
  'Failed to remove admin'
)

const makeMemberAdmin = withToast(
  async (uid: string) => {
    const isCurrent = captureIntent()
    adminActionUid.value = uid
    try {
      await setAppUserAdmin(uid, true)
    } finally {
      if (isCurrent()) adminActionUid.value = null
    }
  },
  'Admin access granted',
  'Failed to grant admin access'
)

const setMemberSubscription = withToast(
  async (value: { uid: string; subscription: 'free' | 'pro' | 'business' }) => {
    const isCurrent = captureIntent()
    subscriptionActionUid.value = value.uid
    try {
      await setAppUserSubscription(value.uid, value.subscription)
    } finally {
      if (isCurrent()) subscriptionActionUid.value = null
    }
  },
  'Subscription updated',
  'Failed to update subscription'
)
</script>
