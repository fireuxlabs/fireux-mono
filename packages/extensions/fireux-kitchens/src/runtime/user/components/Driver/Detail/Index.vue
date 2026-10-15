<template>
  <DriverProfile v-if="driverCard" :card="driverCard" :profile="profile">
    <template #actions>
      <UButton
        v-if="isSelf"
        label="Open driver dashboard"
        icon="i-lucide-gauge"
        color="neutral"
        variant="outline"
        @click="navigateTo('/dashboard/driver')"
      />
    </template>
  </DriverProfile>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import type { ProfileDirectoryEntry } from 'fireux-core/runtime/user/models/user-directory.model'
import type { DriverProfilePayload } from '../../../utils/driver'
import { useDriverInterface } from '../../../composables/driver/useDriverInterface'
const props = defineProps<{
  profile: DriverProfilePayload & { id: string }
  user: ProfileDirectoryEntry<DriverProfilePayload>['user']
}>()
const { user: sessionUser } = useUserSession()
const { profile: project } = useDriverInterface()
const driverCard = computed(() => project(props.profile, props.user))
const isSelf = computed(() =>
  Boolean(props.user.id && sessionUser.value?.id === props.user.id)
)
</script>
