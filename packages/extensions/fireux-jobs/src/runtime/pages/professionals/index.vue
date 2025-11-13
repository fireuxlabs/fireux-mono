<!-- packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Professionals"
      description="Inspect your professional profile and browse all professionals available to this runtime."
    />

    <UPageBody class="space-y-6">
      <template v-if="currentProfessional">
        <OrganismsProfilesProfessionalSectionsSingle
          :professional="currentProfessional"
        />
      </template>
      <template v-else>
        <UPageCTA :title="cta.title" :description="cta.description">
          <template #links>
            <UButton
              v-for="action in cta.actions"
              :key="action.id"
              :color="action.color ?? 'primary'"
              :variant="action.variant ?? 'solid'"
              :to="action.click ? undefined : action.to ?? undefined"
              :loading="action.loading ?? false"
              @click="onAction(action, $event)"
            >
              {{ action.label }}
            </UButton>
          </template>
        </UPageCTA>
      </template>

      <OrganismsProfilesProfessionalSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'

import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useProfessionalComputed } from '../../composables/firestore/profiles/Professional/main/useProfessionalComputed.ts'
import { useProfessionalInterface } from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/main/useProfessionalCreate.ts'

definePageMeta({
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-briefcase',
    order: 60,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Professionals',
  description: 'Professional profiles resolved for this runtime.',
  layout: 'default',
  name: 'ProfessionalsIndexPage',
})

useHead({ title: 'Professionals' })

const { profile } = useProfessional()
const { activeProfile } = useProfessionalComputed(profile)
const { ctaFor } = useProfessionalInterface(profile)
const { createProfessional } = useProfessionalCreate()

const currentProfessional = computed(() => activeProfile.value ?? null)

type ViewAction = {
  id: string
  label: string
  to?: string | null
  color?: string
  variant?: string
  click?: () => unknown | Promise<unknown>
  loading?: boolean
}

const creating = createProfessional.state

const onEnsure = async () => {
  await createProfessional()
}

const cta = computed(() => {
  const base = ctaFor(currentProfessional.value)
  const actions: ViewAction[] = base.actions.map((action) => {
    if (action.id === 'create-professional') {
      return {
        ...action,
        click: onEnsure,
        loading: creating.value,
      }
    }
    return action
  })

  return {
    title: base.title,
    description: base.description,
    actions,
  }
})

const onAction = async (action: ViewAction, event: MouseEvent) => {
  if (!action.click) return
  event.preventDefault()
  await action.click()
}
</script>
