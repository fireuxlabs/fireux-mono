<template>
  <section class="grid gap-5 md:grid-cols-2" aria-label="Capability summaries">
    <Summary title="Team" icon="i-lucide-users" to="/workspace/project/team" :value="team.members.value.length" description="People in this team" :pending="team.pending.value" :error="team.error.value">
      <div class="flex flex-wrap gap-2">
        <UTooltip v-for="member in team.members.value.slice(0, 8)" :key="member.id || member.memberId" :text="member.name">
          <UAvatar :src="member.avatar || undefined" :alt="member.name" size="md" tabindex="0" />
        </UTooltip>
      </div>
      <p v-if="!team.members.value.length" class="text-sm text-muted">No team members yet.</p>
    </Summary>
    <Summary title="Tests" icon="i-lucide-flask-conical" to="/workspace/project/test" :value="tests.records.value?.length || 0" description="Saved strings" :pending="tests.pending.value" :error="tests.error.value">
      <ul class="space-y-1 text-sm"><li v-for="test in (tests.records.value || []).slice(0, 3)" :key="test.id" class="truncate">{{ test.value }}</li></ul>
      <p v-if="!tests.records.value?.length" class="text-sm text-muted">No tests yet.</p>
    </Summary>
    <Summary title="Identity" icon="i-lucide-id-card" to="/workspace/project/identity" :value="`${completion}%`" :description="`${filled} of ${fields.length} identity fields filled`" :pending="props.publication?.status === 'pending'" :error="props.publication?.status === 'error'">
      <UProgress :model-value="completion" aria-label="Identity completion" />
    </Summary>
    <Summary title="Calendar" icon="i-lucide-calendar" to="/workspace/project/calendar" value="Not connected" description="An event source has not been connected yet." />
    <Summary title="Workspaces" icon="i-lucide-panels-top-left" to="/" :value="index.collection.value.length" description="Available project workspaces" :pending="index.outcome.value === 'pending'" :error="index.outcome.value === 'error'" />
    <Summary title="Notifications" icon="i-lucide-bell" :value="notifications.unreadCount.value" description="Unread in your feed across all workspaces" :pending="notifications.pending.value" :error="notifications.error.value">
      <UButton label="Open notifications" color="neutral" variant="soft" @click="notificationPanel.open()" />
    </Summary>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Summary from '../../../../components/Workspace/Overview/Summary.vue'
import { useProjectTeamSummary } from '../../../composables/useProjectTeamSummary'
import { useProjectTestRecords } from '../../../composables/useProjectTestRecords'
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'
import { useProjectWorkspaceIndex } from '../../../composables/workspace/index/useProjectWorkspaceIndex'
import { useUserNotifications } from '../../../../user/composables/notifications/useUserNotifications'
import { useWorkspaceNotifications } from '../../../../composables/fireux/workspace/useWorkspaceNotifications'

import type { ProjectPublishedIdentity } from '../../../models/published-identity'
const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
const workspace = useProjectWorkspace()
const index = useProjectWorkspaceIndex()
const team = useProjectTeamSummary()
const tests = useProjectTestRecords(workspace.id)
const notifications = useUserNotifications()
const notificationPanel = useWorkspaceNotifications()
const fields = computed(() => [workspace.data.value?.name, props.publication ? props.publication.description : workspace.data.value?.description, props.publication ? props.publication.imageUrl : workspace.data.value?.image_url])
const filled = computed(() => fields.value.filter(value => String(value || '').trim()).length)
const completion = computed(() => fields.value.length ? Math.round(filled.value / fields.value.length * 100) : 0)
</script>
