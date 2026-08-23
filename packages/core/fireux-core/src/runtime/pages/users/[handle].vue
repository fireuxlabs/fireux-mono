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
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, setResponseStatus } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
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

const { user: sessionUser, subscription } = useUser()
const isOwnProfile = computed(() =>
  Boolean(user.value?.id && sessionUser.value?.id === user.value.id)
)
// Editing remains self-only until a trusted target-User writer exists.
const canEdit = computed(() => isOwnProfile.value)

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
    isOwnProfile: isOwnProfile.value,
    canEdit: canEdit.value,
    subscription: isOwnProfile.value ? subscription.value : null,
  page: { handle: handle.value },
}))
</script>
