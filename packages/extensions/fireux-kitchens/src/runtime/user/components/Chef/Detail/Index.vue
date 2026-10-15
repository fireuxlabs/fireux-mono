<template>
  <ChefProfile v-if="chefCard" :card="chefCard" :profile="profile">
    <template #actions>
      <UButton
        v-if="isSelf"
        label="Manage profile"
        icon="i-lucide-pencil"
        color="neutral"
        variant="outline"
        @click="navigateTo('/dashboard/chef/profile')"
      />
    </template>
  </ChefProfile>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import type { ProfileDirectoryEntry } from 'fireux-core/runtime/user/models/user-directory.model'
import type { ChefProfilePayload } from '../../../utils/chef'
import { useChefInterface } from '../../../composables/chef/useChefInterface'
const props = defineProps<{
  profile: ChefProfilePayload & { id: string }
  user: ProfileDirectoryEntry<ChefProfilePayload>['user']
}>()
const { user: sessionUser } = useUserSession()
const { profile: project } = useChefInterface()
const chefCard = computed(() => project(props.profile, props.user))
const isSelf = computed(() =>
  Boolean(props.user.id && sessionUser.value?.id === props.user.id)
)
</script>
