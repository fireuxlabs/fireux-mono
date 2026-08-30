<template>
  <UPage>
    <UPageBody>
      <!-- 01 Identity — the route resolves and passes the canonical User. -->
      <UserProfile
        v-if="user"
        :user="user"
        :is-own-profile="isOwnProfile"
        :can-edit="isOwnProfile"
        :subscription="isOwnProfile ? subscription : null"
      />

      <!-- 02 App membership — an authorized, separately named App record. -->
      <UserAppMembership
        v-if="user && showMembership"
        :app-name="appName"
        :display-name="user.display_name"
        :membership="subjectMembership"
        :can-manage="canManageMembership"
        :subscription-action-pending="subscriptionActionPending"
        :on-set-subscription="setSubjectSubscription"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import type { AppUserSubscription } from '../../app/models/app-user.model.ts'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useRouteParam } from '../../composables/shared/useRouteParam'
import { useToastify } from '../../composables/ui/useToastify'
import { useUser } from '../../user/composables/useUser'
import { useUserDetail } from '../../user/composables/useUserDetail'
import { useAppUserCollection } from '../../user/composables/firestore/fetch/useAppUserCollection'
import { mutateAppMembership } from '../../user/composables/firestore/utils/appMembershipMutation'
import type { AppAdminMember } from '../../app/models/app-context.model.ts'

definePageMeta({
  layout: 'default',
  title: 'User',
  description: 'View a user profile.',
  name: 'UserDetailPage',
})

const { appName } = useFireUXConfig()
const handle = useRouteParam('handle')
const { user, ready } = useUserDetail(handle)

await ready

const {
  user: sessionUser,
  appUser: viewerAppUser,
  appOutcome,
  subscription,
  isAdmin,
  isDeveloper,
} = useUser()
const isOwnProfile = computed(() =>
  Boolean(user.value?.id && sessionUser.value?.id === user.value.id)
)
const subjectUserId = computed(() => String(user.value?.id || '').trim())
const canManageMembership = computed(() => isAdmin.value || isDeveloper.value)
const canInspectMembership = computed(
  () => isOwnProfile.value || canManageMembership.value
)
const adminMembershipEnabled = computed(
  () => canManageMembership.value && !isOwnProfile.value
)
const {
  memberships,
  outcome: adminMembershipOutcome,
  truncated: adminMembershipsTruncated,
  refresh: refreshMemberships,
} = useAppUserCollection({ enabled: adminMembershipEnabled })
const toast = useToastify()
const subscriptionActionPending = ref(false)

type UserAppMembershipRecord = Pick<
  AppAdminMember,
  'id' | 'role' | 'subscription'
>

const subjectMembership = computed<UserAppMembershipRecord | null>(() => {
  if (!subjectUserId.value) return null
  if (isOwnProfile.value) {
    const membership = viewerAppUser.value
    return membership
      ? {
          id: subjectUserId.value,
          role: membership.role,
          subscription: membership.subscription,
        }
      : null
  }

  const membership = memberships.value.find(
    (candidate) => candidate.id === subjectUserId.value
  )
  return membership
    ? {
        id: membership.id,
        role: membership.role,
        subscription: membership.subscription,
      }
    : null
})
const membershipResolved = computed(() => {
  if (!canInspectMembership.value) return false
  if (subjectMembership.value) return true
  if (isOwnProfile.value) return appOutcome.value === 'missing'
  return (
    !adminMembershipsTruncated.value &&
    (adminMembershipOutcome.value === 'ready' ||
      adminMembershipOutcome.value === 'empty')
  )
})
const showMembership = computed(
  () => canInspectMembership.value && membershipResolved.value
)
async function setSubjectSubscription(subscription: AppUserSubscription) {
  const membership = subjectMembership.value
  if (
    !canManageMembership.value ||
    !membership ||
    membership.subscription === subscription ||
    subscriptionActionPending.value
  ) {
    return
  }

  subscriptionActionPending.value = true
  try {
    await mutateAppMembership({
      action: 'set-subscription',
      userId: membership.id,
      subscription,
    })
    if (!isOwnProfile.value) await refreshMemberships()
    toast.success(
      `${user.value?.display_name || 'User'} is now ${subscription}.`
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Subscription update failed: ${message}`)
  } finally {
    subscriptionActionPending.value = false
  }
}
const title = computed(() =>
  user.value?.display_name
    ? `${user.value.display_name} | ${appName}`
    : `User | ${appName}`
)
const description = computed(() => user.value?.bio || 'User profile.')
const path = computed(() => `/users/${encodeURIComponent(handle.value)}`)

useSeo({
  title,
  description,
  path,
  image: computed(() => user.value?.avatar),
  robots: 'index, follow',
})
</script>
