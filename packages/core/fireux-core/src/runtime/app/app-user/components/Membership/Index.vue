<template>
  <section aria-label="App membership">
    <div>
      <UIcon name="i-lucide-building-2" />
      <div>
        <h2>{{ appName }}</h2>
        <p>
          {{ membership ? roleLabel : 'No membership' }}
        </p>
      </div>
    </div>
    <div>
      <AppUserAccessBadge
        v-if="membership"
        :subscription="membership.subscription"
      />
      <UButton
        v-if="canManage"
        :to="editTo"
        icon="i-lucide-settings-2"
        aria-label="Manage App membership"
        color="neutral"
        variant="ghost"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from '../../../../user/composables/session/useUserSession'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../composables/config/FireUXConfig'
import type { AppUserMembershipRecord } from '../../composables/useAppUserMembership'
import type { User } from '../../../../user/models/user.model.ts'

defineOptions({ name: 'AppUserMembership' })

const props = defineProps<{
  user: User
  membership: AppUserMembershipRecord | null
}>()

const { appName } = useFireUXConfig()
const { isAdmin, isDeveloper } = useUserSession()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
const editTo = computed(
  () => `/users/${encodeURIComponent(props.user.handle)}/edit`
)
const roleLabel = computed(() => {
  if (!props.membership) return ''
  if (props.membership.role === 'dev') return 'Developer'
  return props.membership.role === 'admin' ? 'Administrator' : 'User'
})
</script>
