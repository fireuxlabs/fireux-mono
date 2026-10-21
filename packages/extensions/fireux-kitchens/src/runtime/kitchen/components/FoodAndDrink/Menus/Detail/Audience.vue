<template>
  <UCard v-if="menu && menu.schedule !== 'daily'">
    <template #header
      ><h2 class="font-semibold">Audience &amp; access</h2></template
    >
    <div class="space-y-4">
      <UFormField label="Who can view this Menu?">
        <USelect
          v-model="audience"
          :items="choices"
          :disabled="!canWrite || busy"
          class="w-full"
        />
      </UFormField>
      <p class="text-sm text-muted">
        {{
          audience === 'private_link'
            ? 'After publishing, anyone with the link can view it. It stays off public Menu lists. The link is not password protected.'
            : 'After publishing, anyone can find it on the venue’s Menu page and public listings.'
        }}
      </p>
      <p class="text-sm text-muted">
        Protected group needs password protection and is not available yet.
      </p>
      <p
        v-if="menu.status === 'published' && changed"
        class="text-sm text-warning"
      >
        Saving changes the audience of this published Menu immediately.
      </p>
      <UButton
        label="Save audience"
        :disabled="!canWrite || !changed || busy"
        :loading="busy"
        @click="save"
      />
      <p v-if="message" role="status" class="text-sm text-success">
        {{ message }}
      </p>
      <MoleculesCopyError v-if="error" :message="error" />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
const { menu, kitchenId, menuId, canWrite, updateMenu } =
  useKitchenMenuRecordContext()
const audience = ref<'public' | 'private_link'>('public')
const busy = ref(false),
  error = ref(''),
  message = ref('')
const choices = [
  { label: 'Public', value: 'public' },
  { label: 'Private link', value: 'private_link' },
  {
    label: 'Protected group — unavailable',
    value: 'protected_group',
    disabled: true,
  },
]
watch(
  () => [menu.value?.id, menu.value?.audience],
  () => {
    audience.value =
      menu.value?.audience === 'private_link' ? 'private_link' : 'public'
  },
  { immediate: true }
)
const changed = computed(
  () => audience.value !== (menu.value?.audience || 'public')
)
const captureScope = useMenuEditorScope([kitchenId, menuId], () => {
  busy.value = false
  error.value = ''
  message.value = ''
})
async function save() {
  if (!canWrite.value || !changed.value || busy.value) return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    await updateMenu(kitchenId.value, menuId.value, {
      audience: audience.value,
    })
    if (isCurrent()) message.value = 'Audience saved.'
  } catch (cause) {
    if (isCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Could not save audience.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
