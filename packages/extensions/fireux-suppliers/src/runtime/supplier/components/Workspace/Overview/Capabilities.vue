<template>
  <section class="grid gap-5 md:grid-cols-2" aria-label="Capability summaries">
    <Summary title="Team" icon="i-lucide-users" to="/workspace/supplier/team" :value="team.members.value.length" description="People in this team" :pending="team.pending.value" :error="team.error.value">
      <div class="flex flex-wrap gap-2">
        <UTooltip v-for="member in team.members.value.slice(0, 8)" :key="member.memberId || member.id" :text="member.name">
          <UAvatar :src="member.avatar || undefined" :alt="member.name" size="md" tabindex="0" />
        </UTooltip>
      </div>
      <p v-if="!team.members.value.length" class="text-sm text-muted">No team members yet.</p>
    </Summary>
    <Summary title="Tests" icon="i-lucide-flask-conical" to="/workspace/supplier/test" value="Not connected" description="String storage is not connected yet." />
    <Summary title="Identity" icon="i-lucide-id-card" to="/workspace/supplier/identity" :value="`${completion}%`" :description="`${filled} of ${fields.length} identity fields filled`" :pending="identity.status.value === 'pending'" :error="identity.status.value === 'error'">
      <UProgress :model-value="completion" aria-label="Identity completion" />
    </Summary>
    <Summary title="Calendar" icon="i-lucide-calendar" to="/workspace/supplier/calendar" value="Not connected" description="An event source has not been connected yet." />
    <Summary title="Workspaces" icon="i-lucide-panels-top-left" to="/" :value="index.collection.value.length" description="Available supplier workspaces" :pending="index.outcome.value === 'pending'" :error="index.outcome.value === 'error'" />
    <Summary title="Notifications" icon="i-lucide-bell" :value="notifications.unreadCount.value" description="Unread in your feed across all workspaces" :pending="notifications.pending.value" :error="notifications.error.value">
      <UButton label="Open notifications" color="neutral" variant="soft" @click="notificationPanel.open()" />
    </Summary>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Summary from 'fireux-core/runtime/components/Workspace/Overview/Summary.vue'
import { useSupplierTeamSummary } from '../../../composables/useSupplierTeamSummary'
import { useSupplierIdentity } from '../../../composables/useSupplierIdentity'
import { useSupplierWorkspaceIndex } from '../../../composables/workspace/index/useSupplierWorkspaceIndex'
import { useUserNotifications } from 'fireux-core/runtime/user/composables/notifications/useUserNotifications'
import { useWorkspaceNotifications } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceNotifications'
const team = useSupplierTeamSummary()
const identity = useSupplierIdentity()
const index = useSupplierWorkspaceIndex()
const notifications = useUserNotifications()
const notificationPanel = useWorkspaceNotifications()
const fields = computed(() => Object.values(identity.fields.value))
const filled = computed(() => fields.value.filter(value => String(value || '').trim()).length)
const completion = computed(() => fields.value.length ? Math.round(filled.value / fields.value.length * 100) : 0)
</script>
