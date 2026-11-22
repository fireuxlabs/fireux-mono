<template>
  <template v-if="selectedMember">
    <WorkspaceTeamSettings
      v-if="editing"
      ref="form"
      :key="selectedMember.id"
      :member="selectedMember"
      :active="editing || editOpen"
      :available="available"
      :update-member="updateMember"
      @request-remove="requestRemove"
    >
      <slot />
    </WorkspaceTeamSettings>
    <WorkspaceSingleCard
      v-else
      :name="selectedMember.name"
      :to="to"
      @open="!to && (editOpen = true)"
    >
      <template #avatar>
        <UAvatar
          :src="selectedMember.avatar || undefined"
          :alt="selectedMember.name"
          icon="i-lucide-user"
          size="xl"
        />
      </template>
      <UBadge
        v-for="role in roles"
        :key="role"
        color="neutral"
        variant="subtle"
        >{{ role }}</UBadge
      >
      <span v-if="roles && !roles.length">No roles assigned</span>
      <UBadge
        :color="selectedMember.userId ? 'success' : 'neutral'"
        variant="subtle"
        >{{
          selectedMember.userId ? 'Account linked' : 'No linked account'
        }}</UBadge
      >
    </WorkspaceSingleCard>
    <UModal v-if="!editing" v-model:open="editOpen" title="Person settings">
      <template #body>
        <WorkspaceTeamSettings
          v-if="editOpen"
          ref="form"
          :key="selectedMember.id"
          :member="selectedMember"
          :active="editing || editOpen"
          :available="available"
          :update-member="updateMember"
          @request-remove="requestRemove"
          ><slot
        /></WorkspaceTeamSettings>
      </template>
    </UModal>
  </template>
  <p v-else class="fx-type-caption">Choose a person from the collection.</p>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkspaceTeamSettings from './Settings.vue'
import type { WorkspaceTeamMember } from '../../composables/useWorkspaceTeam'
import type { WorkspaceCrudPrimitiveId } from '../../models/capability-context'
const props = defineProps<{
  roles?: string[]
  to?: string
  editing?: boolean
  members: readonly WorkspaceTeamMember[]
  selectedMemberId: string
  available: WorkspaceCrudPrimitiveId[]
  updateMember: (input: { memberId: string; name: string }) => Promise<unknown>
}>()
const emit = defineEmits<{ 'request-remove': [memberId: string] }>()
const selectedMember = computed(() =>
  props.members.find((member) => member.id === props.selectedMemberId)
)
const form = ref<InstanceType<typeof WorkspaceTeamSettings>>()
const editOpen = ref(false)
const preparedName = ref<string | null>(null)
watch(
  form,
  (value) => {
    if (value && preparedName.value !== null) {
      value.prepare(preparedName.value)
      preparedName.value = null
    }
  },
  { flush: 'post' }
)
function requestRemove(memberId: string) {
  editOpen.value = false
  emit('request-remove', memberId)
}
function prepareUpdate(name: string) {
  if (!selectedMember.value || !props.available.includes('update')) return
  editOpen.value = true
  if (form.value) form.value.prepare(name)
  else preparedName.value = name
}
defineExpose({ prepareUpdate })
</script>
