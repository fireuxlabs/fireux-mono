<template>
  <form
    class="workspace-surface workspace-surface--compact"
    @submit.prevent="save"
  >
    <UFormField label="Menu name"
      ><USelect
        v-if="subscription === 'free'"
        v-model="name"
        :items="freeMenuNames"
        :disabled="busy || !canCreateMenu" />
      <UInput
        v-else
        v-model="name"
        placeholder="Lunch, terrace, tasting…"
        :maxlength="160"
        :disabled="busy || !canCreateMenu"
    /></UFormField>
    <UFormField
      v-if="canPlanDaily"
      label="Menu type"
      help="Daily menus stay private until you publish a date. You can choose service dates later."
    >
      <USelect
        v-model="schedule"
        :items="scheduleOptions"
        :disabled="busy || !canCreateMenu"
      />
    </UFormField>
    <UFormField label="Description (optional)"
      ><UTextarea
        v-model="description"
        :maxlength="800"
        :disabled="busy || !canCreateMenu"
    /></UFormField>
    <p v-if="menuCreateBlockedMessage" class="fx-type-caption">
      {{ menuCreateBlockedMessage }}
    </p>
    <div v-if="error" class="menu-editor-error">
      <p>{{ error }}</p>
      <FireCopyError :message="error" />
    </div>
    <UButton
      type="submit"
      icon="i-lucide-plus"
      :loading="busy"
      :disabled="!canCreateMenu || !name.trim()"
      >Create menu</UButton
    >
  </form>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { starterMenu } from '../../../../../../menu/content/starter-menu'
import { useMenuEditorScope } from '../../../../../../menu/composables/useMenuEditorScope'
import { useMenuRecordNavigation } from '../../../../../composables/workspace/menu/menus/useMenuRecordNavigation'
const { openView } = useMenuRecordNavigation()
import {
  useOptionalKitchenMenus,
  useKitchenWorkspaceMenus,
} from '../../../../../composables/workspace/menu/menus/useKitchenWorkspaceMenus'
const {
  createMenu,
  kitchenId,
  canCreateMenu,
  menuCreateBlockedMessage,
  subscription,
} = useOptionalKitchenMenus() ?? useKitchenWorkspaceMenus()
const name = defineModel<string>('name', { default: '' })
const freeMenuNames: string[] = [starterMenu.name]
const schedule = ref<'regular' | 'daily' | 'specials'>('regular')
const scheduleOptions: {
  label: string
  value: 'regular' | 'daily' | 'specials'
}[] = [
  { label: 'Regular menu', value: 'regular' },
  { label: 'Daily menu', value: 'daily' },
  { label: 'Specials board', value: 'specials' },
]
const canPlanDaily = computed(() =>
  ['pro', 'business'].includes(subscription.value)
)
watch(
  subscription,
  (tier) => {
    if (tier === 'free' && name.value !== starterMenu.name)
      name.value = starterMenu.name
    if (!canPlanDaily.value) schedule.value = 'regular'
  },
  { immediate: true }
)
const description = ref('')
const busy = ref(false)
const error = ref('')
const route = useRoute()
const captureScope = useMenuEditorScope(
  [
    kitchenId,
    name,
    description,
    schedule,
    canPlanDaily,
    canCreateMenu,
    () => route.fullPath,
  ],
  () => {
    busy.value = false
    error.value = ''
  }
)
async function save() {
  if (
    !canCreateMenu.value ||
    busy.value ||
    (schedule.value !== 'regular' && !canPlanDaily.value)
  )
    return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  try {
    const menu = await createMenu(
      {
        name: name.value.trim(),
        description: description.value.trim(),
        format: 'interactive',
        ...(schedule.value !== 'regular' ? { schedule: 'daily' as const } : {}),
        ...(schedule.value === 'specials'
          ? { purpose: 'specials' as const }
          : {}),
      },
      isCurrent
    )
    if (!isCurrent()) return
    await openView(menu.slug, 'content')
  } catch (caught) {
    if (!isCurrent()) return
    error.value =
      caught instanceof Error ? caught.message : 'Could not create menu.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
