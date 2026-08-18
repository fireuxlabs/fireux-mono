<template>
  <form id="add-team-member" class="space-y-4" @submit.prevent="addTeamMember">
    <UFormField label="Name" :error="validationMessage || undefined">
      <UInput
        v-model="name"
        placeholder="Team member name"
        autofocus
        autocomplete="name"
        maxlength="120"
        :disabled="saving || !canCreateTeamMember"
        @blur="normalizeMemberName"
      />
    </UFormField>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        :disabled="saving"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>

      <UButton
        type="submit"
        icon="i-lucide-user-plus"
        :loading="saving"
        :disabled="!canCreateTeamMember || !normalizedName"
      >
        Add team member
      </UButton>
    </div>

    <UAlert
      v-if="message"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Could not add team member"
      :description="message"
      aria-live="polite"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenTeamMemberCreate } from '../../../composables/console/team/mutations/useKitchenTeamMemberCreate'

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
  created: [result: { ok: true; memberId: string; name: string; slug: string }]
}>()

const { createKitchenTeamMember } = useKitchenTeamMemberCreate()

const name = ref('')
const saving = ref(false)
const message = ref('')
const canCreateTeamMember = computed(() => Boolean(props.kitchenId))
const normalizedName = computed(() => name.value.trim().replace(/\s+/g, ' '))
const validationMessage = computed(() => {
  if (!name.value || normalizedName.value) return ''
  return 'Enter the team member’s name.'
})
const normalizeMemberName = () => {
  name.value = normalizedName.value
}
const addTeamMember = async () => {
  normalizeMemberName()
  if (!canCreateTeamMember.value || !normalizedName.value || saving.value)
    return

  saving.value = true
  message.value = ''

  try {
    const result = await createKitchenTeamMember({
      kitchenId: props.kitchenId,
      name: normalizedName.value,
    })
    emit('created', result)
  } catch (error) {
    message.value = String(
      (error as any)?.message || error || 'Add team member failed.'
    )
  } finally {
    saving.value = false
  }
}
</script>
