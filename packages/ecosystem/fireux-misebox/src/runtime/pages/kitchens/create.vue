<!-- packages/ecosystem/fireux-misebox/src/runtime/pages/kitchens/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Kitchen setup"
      description="Link Misebox kitchens to FireUX Places to unlock shared roster data."
    >
      <template #extra>
        <UButton
          color="primary"
          icon="i-lucide-map"
          variant="soft"
          to="/places"
        >
          Open Places workspace
        </UButton>
      </template>
    </UPageHeader>

    <UContainer class="max-w-4xl space-y-8 py-8">
      <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
        <template #header>
          <div class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-layers" /> How kitchens work now
          </div>
        </template>

        <ol class="list-decimal space-y-3 pl-5 text-sm text-gray-600">
          <li>
            Use the Places workspace to save or import a location (Google search
            or manual entry). This creates the canonical record.
          </li>
          <li>
            Link that place to Misebox by creating a lightweight kitchen doc
            below. The kitchen id must match the place_id.
          </li>
          <li>
            Professionals that reference the same place automatically surface on
            the kitchen detail page.
          </li>
        </ol>

        <UAlert
          color="primary"
          icon="i-lucide-info"
          title="Tip"
          description="You can copy a place’s id from /places or the Places dashboard action menu."
        />
      </UCard>

      <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
        <template #header>
          <div class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-cooking-pot" /> Link a kitchen manually
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <UFormGroup
            label="Place / Kitchen ID"
            required
            help="Use the exact place_id from FireUX Places."
          >
            <UInput
              v-model="form.id"
              placeholder="e.g. ChIJ..."
              icon="i-lucide-hash"
              required
            />
          </UFormGroup>

          <UFormGroup
            label="Display name"
            required
            help="Shown across Misebox cards and profiles."
          >
            <UInput
              v-model="form.name"
              placeholder="The Atlas Bistro"
              icon="i-lucide-type"
              required
            />
          </UFormGroup>

          <UFormGroup
            label="Description"
            help="Optional context for team members."
          >
            <UTextarea
              v-model="form.description"
              placeholder="James Beard nominated tasting counter."
              :rows="3"
            />
          </UFormGroup>

          <UFormGroup
            label="App ID"
            help="Leave blank to use the active Misebox app automatically."
          >
            <UInput
              v-model="form.app_id"
              placeholder="misebox-app"
              icon="i-lucide-app-window"
            />
          </UFormGroup>

          <div class="flex items-center justify-end gap-2">
            <UButton
              color="gray"
              variant="ghost"
              type="button"
              @click="resetForm"
            >
              Reset
            </UButton>
            <UButton
              color="primary"
              type="submit"
              icon="i-lucide-check"
              :loading="isSubmitting"
            >
              Link kitchen
            </UButton>
          </div>
        </form>
      </UCard>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead, useToast } from '#imports'
import { useKitchenCreation } from '../../composables/fireux/firestore/objects/Kitchen/useKitchenCreation'

const router = useRouter()
const toast = typeof useToast === 'function' ? useToast() : undefined
const { create } = useKitchenCreation()

const form = reactive({
  id: '',
  name: '',
  description: '',
  app_id: '',
})

const isSubmitting = ref(false)

function resetForm() {
  form.id = ''
  form.name = ''
  form.description = ''
  form.app_id = ''
}

async function handleSubmit() {
  const safeId = form.id.trim()
  const safeName = form.name.trim()

  if (!safeId || !safeName) {
    toast?.add({
      title: 'Missing required fields',
      description: 'Both the place id and display name are required.',
      color: 'red',
    })
    return
  }

  isSubmitting.value = true

  try {
    await create({
      id: safeId,
      name: safeName,
      description: form.description.trim() || undefined,
      app_id: form.app_id.trim() || null,
    })

    toast?.add({
      title: 'Kitchen linked',
      description: 'Navigate to the kitchen page to review place metadata.',
      color: 'green',
    })

    resetForm()
    await router.push(`/kitchens/${safeId}`)
  } catch (error: any) {
    toast?.add({
      title: 'Kitchen link failed',
      description: error?.message ?? 'Unable to create the kitchen document.',
      color: 'red',
    })
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: 'Kitchen setup · Misebox',
})
</script>
