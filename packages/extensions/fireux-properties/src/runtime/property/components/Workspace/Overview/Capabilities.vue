<template>
  <section class="grid gap-5 md:grid-cols-2" aria-label="Capability summaries">
    <Summary
      title="Team"
      icon="i-lucide-users"
      to="/workspace/property/team"
      :value="team.members.value.length"
      description="People in this team"
      :pending="team.pending.value"
      :error="team.error.value"
    >
      <div class="flex flex-wrap gap-2">
        <UTooltip
          v-for="member in team.members.value.slice(0, 8)"
          :key="member.memberId || member.id"
          :text="member.name"
        >
          <UAvatar
            :src="member.avatar || undefined"
            :alt="member.name"
            size="md"
            tabindex="0"
          />
        </UTooltip>
      </div>
      <p v-if="!team.members.value.length" class="text-sm text-muted">
        No team members yet.
      </p>
    </Summary>
    <Summary
      title="Tests"
      icon="i-lucide-flask-conical"
      to="/workspace/property/test"
      value="Not connected"
      description="String storage is not connected yet."
    />
    <Summary
      title="Identity"
      icon="i-lucide-id-card"
      to="/workspace/property/identity"
      :value="`${completion}%`"
      :description="`${filled} of ${fields.length} identity fields filled`"
      :pending="identity.status.value === 'pending'"
      :error="identity.status.value === 'error'"
    >
      <UProgress :model-value="completion" aria-label="Identity completion" />
    </Summary>
    <Summary
      title="Workspaces"
      icon="i-lucide-panels-top-left"
      to="/"
      :value="workspace.collection.value.length"
      description="Available property workspaces"
      :pending="workspace.collectionOutcome.value === 'pending'"
      :error="workspace.collectionOutcome.value === 'error'"
    />
    <Summary
      title="Notifications"
      icon="i-lucide-bell"
      :value="notifications.unreadCount.value"
      description="Unread in your feed across all workspaces"
      :pending="notifications.pending.value"
      :error="notifications.error.value"
    >
      <UButton
        label="Open notifications"
        color="neutral"
        variant="soft"
        @click="notifications.open()"
      />
    </Summary>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { usePropertyWorkspaceHome } from '../../../composables/workspace/usePropertyWorkspaceHome'
import { usePropertyWorkspaceIdentity } from '../../../composables/workspace/usePropertyWorkspaceIdentity'
import { usePropertyWorkspace } from '../../../composables/workspace/usePropertyWorkspace'
import { useUserNotifications } from 'fireux-core/runtime/user/composables/notifications/useUserNotifications'
const team = usePropertyWorkspaceHome().team
const identity = usePropertyWorkspaceIdentity()
const workspace = usePropertyWorkspace()
const notifications = useUserNotifications()
const fields = computed(() => [identity.name.value, identity.imageUrl.value])
const filled = computed(
  () => fields.value.filter((value) => String(value || '').trim()).length
)
const completion = computed(() =>
  fields.value.length
    ? Math.round((filled.value / fields.value.length) * 100)
    : 0
)
</script>
