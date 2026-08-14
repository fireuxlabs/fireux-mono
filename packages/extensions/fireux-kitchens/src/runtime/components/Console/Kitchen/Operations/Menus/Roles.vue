<template>
  <section class="rounded-xl border border-default bg-default p-4 sm:p-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Primary menu">
        <USelect
          v-model="primaryMenuId"
          :items="menuOptions"
          value-key="value"
          label-key="label"
          placeholder="Choose the primary menu"
          :disabled="readOnly || saving"
          class="w-full"
        />
      </UFormField>

      <div class="space-y-3">
        <USwitch
          v-model="specialsEnabled"
          label="Daily specials"
          description="Show a Specials menu inside the primary menu."
          :disabled="readOnly || saving"
        />

        <UFormField v-if="specialsEnabled && specialsMenuExists" label="Specials menu">
          <USelect
            v-model="specialsMenuId"
            :items="specialsOptions"
            value-key="value"
            label-key="label"
            :disabled="readOnly || saving"
            class="w-full"
          />
        </UFormField>

        <UButton
          v-else-if="specialsEnabled"
          icon="i-lucide-plus"
          color="neutral"
          variant="soft"
          :loading="creating"
          :disabled="readOnly || creating"
          @click="createSpecials"
        >
          Create Specials Menu
        </UButton>
      </div>
    </div>

    <div v-if="canSave" class="mt-4 flex justify-end">
      <UButton :loading="saving" @click="save">Save menu roles</UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from '#imports'
import { useKitchenMenusWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'

const {
  menus,
  readOnly,
  menuConfig,
  updateMenuConfig,
  createSpecialsMenu,
} = useKitchenMenusWorkspace()
const toast = useToast()
const text = (value: unknown) => String(value ?? '').trim()
const primaryMenuId = ref('')
const specialsEnabled = ref(false)
const specialsMenuId = ref('')
const saving = ref(false)
const creating = ref(false)

watch(menuConfig, config => {
  primaryMenuId.value = config.primaryMenuId
  specialsEnabled.value = config.specialsEnabled
  specialsMenuId.value = config.specialsMenuId
}, { immediate: true })

const menuOptions = computed(() => menus.value.map(menu => ({
  label: text(menu.name) || text(menu.id),
  value: text(menu.id),
})))
const specialsOptions = computed(() => menuOptions.value.filter(option =>
  option.value !== primaryMenuId.value
))
const specialsMenuExists = computed(() =>
  specialsOptions.value.some(option => option.value === specialsMenuId.value)
)
const canSave = computed(() =>
  !readOnly.value && (
    primaryMenuId.value !== menuConfig.value.primaryMenuId ||
    specialsEnabled.value !== menuConfig.value.specialsEnabled ||
    specialsMenuId.value !== menuConfig.value.specialsMenuId
  )
)

async function save() {
  saving.value = true
  try {
    await updateMenuConfig({
      primaryMenuId: primaryMenuId.value,
      specialsEnabled: specialsEnabled.value,
      specialsMenuId: specialsEnabled.value ? specialsMenuId.value : '',
    })
    toast.add({ title: 'Menu roles saved', color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Could not save menu roles',
      description: error instanceof Error ? error.message : 'Try again.',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

async function createSpecials() {
  creating.value = true
  try {
    const result = await createSpecialsMenu()
    specialsMenuId.value = result.id
    toast.add({ title: 'Specials Menu created', color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Could not create Specials Menu',
      description: error instanceof Error ? error.message : 'Try again.',
      color: 'error',
    })
  } finally {
    creating.value = false
  }
}
</script>
