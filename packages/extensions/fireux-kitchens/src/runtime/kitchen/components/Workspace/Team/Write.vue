<template>
  <WorkspaceTeamCrudCreatePerson
    :create="addTeamMember"
    @cancel="emit('cancel')"
    @created="handleCreated"
  />
</template>

<script setup lang="ts">
import { useKitchenTeamMemberCreate } from '../../../composables/workspace/team/mutations/useKitchenTeamMemberCreate'

const props = withDefaults(
  defineProps<{
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

const { createKitchenTeamMember } = useKitchenTeamMemberCreate()

const addTeamMember = (person: { name: string; userId?: string }) =>
  createKitchenTeamMember({
    kitchenId: props.kitchenId,
    ...person,
  })
const handleCreated = (result: unknown) =>
  emit('created', result as CreatedResult)
</script>
