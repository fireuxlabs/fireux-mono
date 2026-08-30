<template>
  <UPage>
    <UPageBody class="pagebody">
      <div v-if="pending && !user" class="space-y-4">
        <USkeleton class="h-48 rounded-3xl" />
        <USkeleton class="h-36 rounded-3xl" />
      </div>

      <UserProfile
        v-else-if="user"
        :user="user"
        :is-own-profile="isOwnProfile"
        :can-edit="canEdit"
        :subscription="isOwnProfile ? subscription : null"
      />

      <UPageCard
        v-else-if="failed"
        title="Profile unavailable"
        description="This profile could not be loaded right now."
        icon="i-lucide-cloud-alert"
        variant="subtle"
      >
        <template #footer>
          <UButton
            to="/users"
            label="Browse people"
            color="neutral"
            variant="soft"
          />
        </template>
      </UPageCard>

      <UPageCard
        v-else-if="missing"
        title="User not found"
        description="This user does not exist."
        icon="i-lucide-user-round-x"
        variant="subtle"
      >
        <template #footer>
          <UButton
            to="/users"
            label="Browse people"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UPageCard>

      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="User (JSON)"
        context="canonical User · source: server-read identity database"
        :objects="devJsonData"
        :derived="devJsonDerived"
        :default-open="false"
      />

      <DevDebugPanel
        v-if="canInspectTargetAppUser"
        object-origin="fetched"
        launcher
        title="AppUser (JSON)"
        context="subject membership · source: authorized current-App projection"
        :objects="appUserDevJsonData"
        :derived="appUserDevJsonDerived"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, setResponseStatus, useAsyncData } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import type { AppAdminPeopleResponse } from '../../app/models/app-context.model.ts'
import { resolveAppUserAccess } from '../../app/utils/app-user-access'
import { useUser } from '../../user/composables/useUser'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useUserDetail } from '../../user/composables/useUserDetail'
import { useRouteParam } from '../../composables/shared/useRouteParam'

const { appName } = useFireUXConfig()
const routeHandle = useRouteParam('handle')
const handle = computed(() => routeHandle.value.toLowerCase())
const { user, ready, pending, statusCode, missing, failed } =
  useUserDetail(handle)

await ready

if (import.meta.server) {
  if (missing.value) setResponseStatus(404)
  else if (failed.value)
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
}

const {
  appUser: viewerAppUser,
  isAdmin,
  isDeveloper,
  user: sessionUser,
  subscription,
} = useUser()
const { currentUser: authUser, uid: viewerUid } = useAuth()
const isOwnProfile = computed(() =>
  Boolean(user.value?.id && sessionUser.value?.id === user.value.id)
)
// Editing remains self-only until a trusted target-User writer exists.
const canEdit = computed(() => isOwnProfile.value)
const canInspectTargetAppUser = computed(
  () => isOwnProfile.value || isAdmin.value || isDeveloper.value
)
const subjectUserId = computed(() => String(user.value?.id || '').trim())

const targetAppUserState = useAsyncData(
  () => `profile-app-user-${subjectUserId.value}-${viewerUid.value || 'guest'}`,
  async () => {
    if (
      !import.meta.client ||
      !subjectUserId.value ||
      isOwnProfile.value ||
      !canInspectTargetAppUser.value ||
      !authUser.value
    ) {
      return null
    }
    const token = await authUser.value.getIdToken()
    const response = await $fetch<AppAdminPeopleResponse>(
      '/api/internal/app/people',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return (
      response.members.find((member) => member.id === subjectUserId.value) ??
      null
    )
  },
  {
    server: false,
    lazy: true,
    watch: [subjectUserId, viewerUid, canInspectTargetAppUser, isOwnProfile],
  }
)

const subjectAppUser = computed(() => {
  const membership = isOwnProfile.value
    ? viewerAppUser.value
    : targetAppUserState.data.value
  if (!membership) return null
  return {
    id: subjectUserId.value,
    role: membership.role,
    subscription: membership.subscription,
  }
})
const subjectAppAccess = computed(() =>
  resolveAppUserAccess(subjectAppUser.value)
)
const membershipVisibility = computed(() => {
  if (!canInspectTargetAppUser.value) return 'not_authorized'
  if (isOwnProfile.value) return subjectAppUser.value ? 'ready' : 'missing'
  if (targetAppUserState.pending.value) return 'loading'
  if (targetAppUserState.error.value) return 'error'
  return subjectAppUser.value ? 'ready' : 'missing'
})

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
  robots: computed(() =>
    missing.value ? 'noindex, nofollow' : 'index, follow'
  ),
})

const devJsonData = computed(() => (user.value ? [user.value] : []))
const devJsonDerived = computed(() => ({
  subject: {
    user_id: subjectUserId.value,
    is_viewer: isOwnProfile.value,
  },
  viewer: {
    user_id: viewerUid.value || 'unauthenticated',
    can_edit_subject: canEdit.value,
  },
  page: { handle: handle.value },
}))
const appUserDevJsonData = computed(() =>
  subjectAppUser.value ? [subjectAppUser.value] : []
)
const appUserDevJsonDerived = computed(() => ({
  subject: {
    user_id: subjectUserId.value,
    membership_visibility: membershipVisibility.value,
    ...(subjectAppAccess.value.hasMembership
      ? {
          subscription: subjectAppAccess.value.subscription,
          can_own_multiple_workspaces:
            subjectAppAccess.value.hasBusinessSubscription,
        }
      : {}),
  },
  viewer: {
    user_id: viewerUid.value || 'unauthenticated',
    app_role: viewerAppUser.value?.role || 'none',
    can_inspect_subject_membership: canInspectTargetAppUser.value,
  },
}))
</script>
