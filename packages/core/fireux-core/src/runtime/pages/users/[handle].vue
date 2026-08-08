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
        :access-tier="isOwnProfile ? accessTier : null"
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

      <DevJson
        title="User DTO"
        context="User page · users/[handle] · endpoint-first SSR"
        :data="devJsonData"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, setResponseStatus } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useUser } from '../../composables/fireux/user/useUser'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useUserDetail } from '../../composables/fireux/user/useUserDetail'
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

const { user: sessionUser, accessTier } = useUser()
const isOwnProfile = computed(() =>
  Boolean(user.value?.id && sessionUser.value?.id === user.value.id)
)
// Editing remains self-only until a trusted target-User writer exists.
const canEdit = computed(() => isOwnProfile.value)

const title = computed(() =>
  user.value?.displayName
    ? `${user.value.displayName} | ${appName}`
    : `User | ${appName}`
)
const description = computed(() => user.value?.description || 'User profile.')
const path = computed(
  () => user.value?.path || `/users/${encodeURIComponent(handle.value)}`
)

useSeo({
  title,
  description,
  path,
  image: computed(() => user.value?.image || user.value?.avatar),
  robots: computed(() =>
    missing.value ? 'noindex, nofollow' : 'index, follow'
  ),
})

const devJsonData = computed(() => ({
  objects: { user: user.value },
  derived: {
    isOwnProfile: isOwnProfile.value,
    canEdit: canEdit.value,
    accessTier: isOwnProfile.value ? accessTier.value : null,
  },
  page: { handle: handle.value },
}))
</script>
