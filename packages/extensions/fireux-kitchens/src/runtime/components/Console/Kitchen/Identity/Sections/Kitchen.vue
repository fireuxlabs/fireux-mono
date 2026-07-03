<template>
  <UCollapsible>
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          name="i-lucide-store"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">Kitchen</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Kitchen-owned name, slug, tagline, and theme.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <div class="mt-4 space-y-4">
        <UCard>
          <template #header>
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-store"
                class="mt-1 size-5 shrink-0 text-muted"
              />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Kitchen
                </div>
                <p class="text-sm text-dimmed">
                  What guests and operators see when this kitchen appears.
                </p>
              </div>
            </div>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Name"
                :firebase-value="name"
                placeholder="Kitchen display name"
                :maxlength="120"
                :update-function="handleName"
              />
            </div>

            <MoleculesFormsFirestoreSimpleField
              label="Slug"
              :firebase-value="slug"
              placeholder="luna-piccante"
              :maxlength="80"
              :validation-function="validateSlugField"
              :formatting-function="formatSlugField"
              :update-function="handleSlug"
            />

            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Tagline"
                :firebase-value="tagline"
                placeholder="Short service tagline"
                :maxlength="120"
                :update-function="handleTagline"
              />
            </div>

            <div class="md:col-span-2">
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-palette"
                to="/console/kitchen/identity/theme"
              >
                Open theme
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../../../../models/kitchen.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()

const name = computed(() => readKitchenIdentity(props.kitchen).displayName)
const tagline = computed(() => readKitchenIdentity(props.kitchen).tagline)
const slug = computed(() => String(props.kitchen?.slug ?? ''))

const updateKitchenField = async (
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) => {
  if (!props.canWrite) {
    throw new Error('This kitchen is read-only.')
  }

  if (!props.kitchenId) {
    throw new Error('No kitchen selected.')
  }

  try {
    await updateKitchen(props.kitchenId, patch)
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  updateKitchenField(
    { 'identity.display_name': value },
    'Display name updated',
    'Failed to update display name'
  )

const handleTagline = async (value: string) =>
  updateKitchenField(
    { 'identity.tagline': value },
    'Tagline updated',
    'Failed to update tagline'
  )

const formatSlugField = (value: string) =>
  normalizeSlug(value, { maxLength: 80 })

const validateSlugField = (value: string) => {
  const validation = validateSlug(formatSlugField(value), {
    label: 'Kitchen slug',
    namespace: KitchenStorage.rootCollection,
    reservedScope: 'root',
    maxLength: 80,
  })

  return {
    isValid: validation.isValid,
    message: validation.message,
  }
}

const handleSlug = async (value: string) =>
  updateKitchenField(
    { slug: formatSlugField(value) },
    'Slug updated',
    'Failed to update slug'
  )
</script>
