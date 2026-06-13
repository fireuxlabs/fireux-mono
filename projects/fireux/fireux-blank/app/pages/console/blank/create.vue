<template>
  <UDashboardPanel id="console-blank-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Blank" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UPageCard
          v-if="canCreate"
          title="Blank target"
          description="This creates the smallest console target: root truth plus app console scope."
          variant="subtle"
        >
          <form class="space-y-4" @submit.prevent="handleCreate">
            <UFormField label="Name">
              <UInput
                v-model="name"
                placeholder="Blank target"
                autocomplete="off"
              />
            </UFormField>

            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              icon="i-lucide-circle-alert"
              title="Create failed"
              :description="error"
            />

            <div class="flex items-center gap-2">
              <UButton
                type="submit"
                icon="i-lucide-plus"
                color="primary"
                :loading="creating"
              >
                Create Blank
              </UButton>

              <UButton
                to="/console/blank"
                variant="ghost"
                color="neutral"
              >
                Cancel
              </UButton>
            </div>
          </form>
        </UPageCard>

        <UPageCard
          v-else
          title="Blank creation is not enabled here"
          description="This app uses existing Blank console targets."
          variant="subtle"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useBlankConsole } from '../../../composables/fireux/console/blank/core/useBlankConsole'
import { useBlankCreate } from '../../../composables/fireux/firestore/blank/useBlank'

definePageMeta({
  layout: 'console',
  name: 'BlankConsoleCreatePage',
  nav: {
    key: 'console-blank-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const name = ref('Blank target')
const creating = ref(false)
const error = ref('')
const { canCreateTarget } = useConsole('blank')
const canCreate = computed(() => canCreateTarget())
const { createBlank } = useBlankCreate()
const { actions } = useBlankConsole()

async function handleCreate() {
  if (!canCreate.value) return
  if (creating.value) return

  creating.value = true
  error.value = ''

  try {
    const result = await createBlank({ name: name.value })
    actions.selectBlank(result.id)
    await navigateTo('/console/blank')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    creating.value = false
  }
}

useSeoMeta({
  title: 'Create Blank',
  description: 'Create a Blank console target.',
  robots: 'noindex, nofollow',
})
</script>
