<template>
  <section
    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-default bg-elevated/30 px-5 py-4"
    aria-label="App membership"
  >
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-building-2" class="size-5 text-primary" />
      <div>
        <h2 class="text-sm font-semibold text-highlighted">{{ appName }}</h2>
        <p class="text-xs text-muted">
          {{ membership ? roleLabel : 'No membership' }}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <UserAccessBadge
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
        class="rounded-full"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from '../../composables/session/useUserSession'
import { computed } from 'vue'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import type { AppUserMembershipRecord } from '../../../app/composables/membership/useAppUserMembership'
import type { User } from '../../models/user.model.ts'

defineOptions({ name: 'UserAppMembership' })

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
