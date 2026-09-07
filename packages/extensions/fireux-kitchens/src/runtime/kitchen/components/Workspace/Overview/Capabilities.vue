<template>
  <section class="grid gap-5 md:grid-cols-2" aria-label="Capability summaries">
    <Summary title="Team" icon="i-lucide-users" to="/workspace/kitchen/team" :value="team.members.value.length" description="People in this team" :pending="team.pending.value" :error="team.error.value">
      <div class="flex flex-wrap gap-2">
        <UTooltip v-for="member in team.members.value.slice(0, 8)" :key="member.id || member.memberId" :text="member.name">
          <UAvatar :src="member.avatar || undefined" :alt="member.name" size="md" tabindex="0" />
        </UTooltip>
      </div>
      <p v-if="!team.members.value.length" class="text-sm text-muted">No team members yet.</p>
    </Summary>
    <Summary title="Tests" icon="i-lucide-flask-conical" to="/workspace/kitchen/test" :value="tests.records.value?.length || 0" description="Saved strings" :pending="tests.pending.value" :error="tests.error.value">
      <ul class="space-y-1 text-sm"><li v-for="test in (tests.records.value || []).slice(0, 3)" :key="test.id" class="truncate">{{ test.value }}</li></ul>
      <p v-if="!tests.records.value?.length" class="text-sm text-muted">No tests yet.</p>
    </Summary>
    <Summary title="Identity" icon="i-lucide-id-card" to="/workspace/kitchen/identity" :value="`${completion}%`" :description="`${filled} of ${fields.length} identity fields filled`" :pending="identity.pending.value" :error="identity.placeOutcome.value === 'error'">
      <UProgress :model-value="completion" aria-label="Identity completion" />
    </Summary>
    <Summary title="Calendar" icon="i-lucide-calendar" to="/workspace/kitchen/calendar" value="Not connected" description="An event source has not been connected yet." />
    <Summary title="Workspaces" icon="i-lucide-panels-top-left" to="/" :value="index.collection.value.length" description="Available kitchen workspaces" :pending="index.outcome.value === 'pending'" :error="index.outcome.value === 'error'" />
    <Summary title="Notifications" icon="i-lucide-bell" :value="notifications.unreadCount.value" description="Unread in your feed across all workspaces" :pending="notifications.pending.value" :error="notifications.error.value">
      <UButton label="Open notifications" color="neutral" variant="soft" @click="notificationPanel.open()" />
    </Summary>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Summary from 'fireux-core/runtime/components/Workspace/Overview/Summary.vue'
import { useKitchenTeamSummary } from '../../../composables/useKitchenTeamSummary'
import { useKitchenTestRecords } from '../../../composables/useKitchenTestRecords'
import { useKitchenWorkspace } from '../../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useUserNotifications } from 'fireux-core/runtime/user/composables/firestore/fetch/useUserNotifications'
import { useWorkspaceNotifications } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceNotifications'
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
import { readPlaceIdentity } from 'fireux-places/runtime/place/models/identity-edit'
const workspace = useKitchenWorkspace()
const index = useKitchenWorkspaceIndex()
const team = useKitchenTeamSummary()
const tests = useKitchenTestRecords(workspace.id)
const notifications = useUserNotifications()
const notificationPanel = useWorkspaceNotifications()
const identity = useKitchenWorkspacePlace()
const fields = computed(() => Object.values(readPlaceIdentity(identity.place.value)))
const filled = computed(() => fields.value.filter(value => String(value || '').trim()).length)
const completion = computed(() => fields.value.length ? Math.round(filled.value / fields.value.length * 100) : 0)
</script>
