<template>
  <section class="grid gap-5 md:grid-cols-2" aria-label="Capability summaries">
    <Summary
      title="Team"
      icon="i-lucide-users"
      to="/workspace/project/team"
      :value="team.members.value.length"
      description="People in this team"
      :pending="team.pending.value"
      :error="team.error.value"
    >
      <div class="flex flex-wrap gap-2">
        <UTooltip
          v-for="member in team.members.value.slice(0, 8)"
          :key="member.id || member.memberId"
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
      to="/workspace/project/test"
      :value="tests.records.value?.length || 0"
      description="Saved strings"
      :pending="tests.pending.value"
      :error="tests.error.value"
    >
      <ul class="space-y-1 text-sm">
        <li
          v-for="test in (tests.records.value || []).slice(0, 3)"
          :key="test.id"
          class="truncate"
        >
          {{ test.value }}
        </li>
      </ul>
      <p v-if="!tests.records.value?.length" class="text-sm text-muted">
        No tests yet.
      </p>
    </Summary>
    <Summary
      title="Identity"
      icon="i-lucide-id-card"
      to="/workspace/project/identity"
      :value="identityReady ? `${completion}%` : '—'"
      :description="
        identityReady
          ? `${filled} of ${fields.length} identity fields filled`
          : 'Identity information is not ready.'
      "
      :pending="props.publication?.status === 'pending'"
      :error="props.publication?.status === 'error'"
    >
      <UProgress
        v-if="identityReady"
        :model-value="completion"
        aria-label="Identity completion"
      />
    </Summary>
    <Summary
      title="Apps"
      icon="i-lucide-panels-top-left"
      to="/workspace/project/apps"
      :value="relationshipValue(apps)"
      description="Apps loaded for this Project"
      :pending="relationshipOutcome(apps) === 'pending'"
      :error="relationshipOutcome(apps) === 'error'"
    />
    <Summary
      title="Ecosystems"
      icon="i-lucide-network"
      to="/workspace/project/ecosystem"
      :value="relationshipValue(ecosystems)"
      description="Ecosystems linked to this Project"
      :pending="relationshipOutcome(ecosystems) === 'pending'"
      :error="relationshipOutcome(ecosystems) === 'error'"
    />
    <Summary
      title="Calendar"
      icon="i-lucide-calendar"
      to="/workspace/project/calendar"
      value="Not connected"
      description="An event source has not been connected yet."
    />
    <Summary
      title="Workspaces"
      icon="i-lucide-panels-top-left"
      to="/"
      :value="workspace.collection.value.length"
      description="Available project workspaces"
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
import { computed, type Ref } from 'vue'
import { useProjectApps } from '../../../composables/useProjectApps'
import { useProjectEcosystems } from '../../../composables/useProjectEcosystems'
import Summary from 'fireux-core/runtime/workspace/components/Overview/Summary.vue'
import { useProjectWorkspaceHome } from '../../../composables/workspace/useProjectWorkspaceHome'
import { useProjectTestRecords } from '../../../composables/useProjectTestRecords'
import { useProjectWorkspace } from '../../../composables/workspace/useProjectWorkspace'
import { useUserNotifications } from 'fireux-core/runtime/user/composables/notifications/useUserNotifications'

import type { ProjectPublishedIdentity } from '../../../models/published-identity'
const props = defineProps<{ publication?: ProjectPublishedIdentity | null }>()
const relationshipId = computed(() =>
  workspace.outcome.value === 'ready' ? workspace.id.value : ''
)
const apps = useProjectApps(relationshipId, { management: true })
const ecosystems = useProjectEcosystems(relationshipId)
type RelationshipSource = {
  count: Readonly<Ref<number>>
  outcome: Readonly<Ref<string>>
}
const relationshipOutcome = (source: RelationshipSource) =>
  workspace.outcome.value === 'ready'
    ? source.outcome.value
    : workspace.outcome.value
const relationshipValue = (source: RelationshipSource) =>
  ['ready', 'empty'].includes(relationshipOutcome(source))
    ? source.count.value
    : '—'
const workspace = useProjectWorkspace()
const team = useProjectWorkspaceHome().team
const tests = useProjectTestRecords(workspace.id)
const notifications = useUserNotifications()
const identityReady = computed(
  () =>
    workspace.outcome.value === 'ready' &&
    (!props.publication || props.publication.status === 'ready')
)
const fields = computed(() => [
  workspace.data.value?.identity.name,
  props.publication
    ? props.publication.description
    : workspace.data.value?.identity.description,
  props.publication
    ? props.publication.imageUrl
    : workspace.data.value?.identity.image_url,
])
const filled = computed(
  () => fields.value.filter((value) => String(value || '').trim()).length
)
const completion = computed(() =>
  fields.value.length
    ? Math.round((filled.value / fields.value.length) * 100)
    : 0
)
</script>
