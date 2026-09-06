<template>
  <WorkspaceTeamCrudCreatePerson
    :create="addTeamMember"
    :initial-name="initialName"
    @cancel="emit('cancel')"
    @created="handleCreated"
  >
    <WorkspaceKitchenTeamJobTitle v-model="jobTitle" />
  </WorkspaceTeamCrudCreatePerson>
</template>

<script setup lang="ts">
import WorkspaceKitchenTeamJobTitle from './JobTitle.vue'
import { ref } from 'vue'
import { useKitchenTeamMemberCreate } from '../../../composables/workspace/team/mutations/useKitchenTeamMemberCreate'

const props = withDefaults(
  defineProps<{
    initialName?: string
    initialJobTitle?: string
    kitchenId?: string
  }>(),
  {
    kitchenId: '',
  }
)
const emit = defineEmits<{
  cancel: []
  created: [result: CreatedResult]
}>()
type CreatedResult = { ok: true; memberId: string; name: string; slug: string }

const jobTitle = ref(props.initialJobTitle || '')
const { createKitchenTeamMember } = useKitchenTeamMemberCreate()

const addTeamMember = (person: { name: string; userId?: string }) =>
  createKitchenTeamMember({
    kitchenId: props.kitchenId,
    ...person,
    jobTitle: jobTitle.value,
  })
const handleCreated = (result: unknown) =>
  emit('created', result as CreatedResult)
</script>
