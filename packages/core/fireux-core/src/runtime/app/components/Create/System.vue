<template>
  <UContainer class="max-w-3xl py-6">
    <ClientOnly>
      <div
        v-if="!hasAuthState || (isAuthenticated && userPending)"
        class="flex min-h-64 flex-col items-center justify-center gap-3 text-center"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-7 animate-spin text-primary"
        />
        <p class="text-sm text-muted">Checking your account…</p>
      </div>

      <template v-else-if="!coreUser && !isAuthenticated">
        <AuthSystem />
      </template>
      <template v-else-if="!coreUser">
        <UserCreateSystem />
      </template>

      <div v-else class="space-y-6">
        <UAlert
          v-if="policy.unavailable_reason"
          color="warning"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="App creation is not available here"
          :description="policy.unavailable_reason"
        />

        <template v-else>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted">Creating from</p>
              <p class="font-medium text-highlighted">
                {{ policy.host_app_name }}
              </p>
            </div>
            <UBadge color="neutral" variant="soft">New App</UBadge>
          </div>

          <section v-if="placementCards.length > 1" class="space-y-3">
            <div>
              <h2 class="font-semibold text-highlighted">
                Where will it belong?
              </h2>
              <p class="mt-1 text-sm text-muted">
                This determines its App role and infrastructure boundary.
              </p>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <button
                v-for="option in placementCards"
                :key="option.id"
                type="button"
                class="rounded-lg border p-4 text-left transition"
                :class="
                  draft.placement === option.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-default bg-default hover:border-accented'
                "
                @click="selectPlacement(option.id)"
              >
                <UIcon :name="option.icon" class="mb-3 size-5 text-primary" />
                <span class="block font-medium text-highlighted">{{
                  option.label
                }}</span>
                <span class="mt-1 block text-sm text-muted">{{
                  option.description
                }}</span>
              </button>
            </div>
          </section>

          <UAlert
            v-else-if="selectedPlacementCard"
            color="primary"
            variant="soft"
            :icon="selectedPlacementCard.icon"
            :title="selectedPlacementCard.label"
            :description="selectedPlacementCard.description"
          />

          <UCard>
            <template #header>
              <div>
                <h2 class="font-semibold text-highlighted">App identity</h2>
                <p class="mt-1 text-sm text-muted">
                  Start with the new App. Product configuration comes after its
                  identity is agreed.
                </p>
              </div>
            </template>

            <div class="space-y-5">
              <UFormField label="App name" name="name" required>
                <UInput
                  :model-value="draft.name"
                  class="w-full"
                  placeholder="e.g. Friiites"
                  autofocus
                  @update:model-value="onNameInput"
                />
              </UFormField>

              <UFormField
                label="App slug"
                name="slug"
                description="Used for the App id, project folder and default hostname."
                required
              >
                <UInput
                  :model-value="draft.slug"
                  class="w-full"
                  placeholder="e.g. friiites"
                  @update:model-value="onSlugInput"
                />
              </UFormField>

              <UFormField label="Description" name="description">
                <UTextarea
                  v-model="draft.description"
                  class="w-full"
                  :rows="4"
                  placeholder="What is this App for?"
                />
              </UFormField>
            </div>

            <template #footer>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs text-muted">
                  Nothing is created until the reviewed setup is provisioned.
                </p>
                <UButton
                  icon="i-lucide-arrow-right"
                  trailing
                  :disabled="!canReview"
                  @click="reviewing = true"
                >
                  Review App setup
                </UButton>
              </div>
            </template>
          </UCard>

          <UCard v-if="reviewing && selectedOption">
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="font-semibold text-highlighted">Setup review</h2>
                <UBadge color="warning" variant="soft">Not created yet</UBadge>
              </div>
            </template>

            <dl class="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-muted">Name</dt>
                <dd class="mt-1 font-medium text-highlighted">
                  {{ draft.name }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">App id</dt>
                <dd class="mt-1 font-mono text-highlighted">
                  {{ draft.slug }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">Role</dt>
                <dd class="mt-1 text-highlighted">
                  {{ selectedOption.app_role }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">Ecosystem</dt>
                <dd class="mt-1 text-highlighted">
                  {{
                    selectedOption.target_ecosystem_id ||
                    'New infrastructure boundary'
                  }}
                </dd>
              </div>
              <div v-if="draft.description" class="sm:col-span-2">
                <dt class="text-muted">Description</dt>
                <dd class="mt-1 text-highlighted">{{ draft.description }}</dd>
              </div>
            </dl>

            <template #footer>
              <p class="text-sm text-muted">
                The trusted provisioner will create source, assets,
                configuration and infrastructure before the canonical App record
                is saved.
              </p>
            </template>
          </UCard>
        </template>
      </div>

      <template #fallback>
        <div
          class="flex min-h-64 flex-col items-center justify-center gap-3 text-center"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-7 animate-spin text-primary"
          />
          <p class="text-sm text-muted">Checking your account…</p>
        </div>
      </template>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type {
  AppOnboardingDraft,
  AppOnboardingPlacement,
} from '../../models/app-onboarding'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../user/composables/useUser'
import { resolveAppOnboardingPolicy } from '../../utils/app-onboarding-policy'
import { normalizeSlug } from '../../../utils/slug/normalizeSlug'
import UserCreateSystem from '../../../user/components/Create/System.vue'

type PlacementCard = {
  id: AppOnboardingPlacement
  label: string
  description: string
  icon: string
}

const placementContent: Record<
  AppOnboardingPlacement,
  Omit<PlacementCard, 'id'>
> = {
  tenant: {
    label: 'App in this ecosystem',
    description: 'A tenant App using this ecosystem’s shared infrastructure.',
    icon: 'i-lucide-blocks',
  },
  standalone: {
    label: 'Standalone App',
    description: 'A FireUX App with its own dedicated database boundary.',
    icon: 'i-lucide-app-window',
  },
  ecosystem: {
    label: 'New ecosystem',
    description: 'A new ecosystem whose first App becomes its Main App.',
    icon: 'i-lucide-orbit',
  },
}

const config = useFireUXConfig()
const policy = resolveAppOnboardingPolicy(config)
const { hasAuthState, isAuthenticated } = useAuth()
const { coreUser, pending: userPending } = useUserSession()

const draft = reactive<AppOnboardingDraft>({
  name: '',
  slug: '',
  description: '',
  placement: policy.locked_placement || '',
})
const slugEdited = ref(false)
const reviewing = ref(false)

const placementCards = computed<PlacementCard[]>(() =>
  policy.options.map((option) => ({
    id: option.id,
    ...placementContent[option.id],
  }))
)
const selectedOption = computed(() =>
  policy.options.find((option) => option.id === draft.placement)
)
const selectedPlacementCard = computed(() =>
  placementCards.value.find((option) => option.id === draft.placement)
)
const canReview = computed(
  () =>
    Boolean(selectedOption.value) &&
    Boolean(draft.name.trim()) &&
    Boolean(draft.slug.trim())
)

function onNameInput(value: unknown) {
  draft.name = String(value || '')
  if (!slugEdited.value) draft.slug = normalizeSlug(value, { maxLength: 63 })
  reviewing.value = false
}

function onSlugInput(value: unknown) {
  slugEdited.value = true
  draft.slug = normalizeSlug(value, { maxLength: 63 })
  reviewing.value = false
}

function selectPlacement(placement: AppOnboardingPlacement) {
  draft.placement = placement
  reviewing.value = false
}
</script>
