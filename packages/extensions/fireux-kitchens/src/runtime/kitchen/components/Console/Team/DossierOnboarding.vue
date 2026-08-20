<template>
  <div class="space-y-5">
    <template v-if="!draft">
      <UAlert
        title="Review before creating"
        description="The dossier is used to prepare a draft, then deleted. Nothing is added to the Team until you review and confirm it."
        color="neutral"
        variant="soft"
      />
      <UFormField label="Team member dossier" hint="PDF or image, max 10 MB">
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          class="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-elevated file:px-3 file:py-2 file:text-sm file:font-medium file:text-highlighted"
          @change="selectFile"
        />
      </UFormField>
      <UButton
        label="Prepare draft"
        icon="i-lucide-file-scan"
        :loading="extracting"
        :disabled="!file || extracting"
        @click="prepareDraft"
      />
    </template>

    <form v-else class="space-y-4" @submit.prevent="createMember">
      <UAlert
        v-if="draft.warnings.length"
        title="Check these details"
        :description="draft.warnings.join(' ')"
        color="warning"
        variant="soft"
      />
      <UFormField label="Name" required>
        <UInput v-model="draft.name" maxlength="120" class="w-full" />
      </UFormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Role">
          <UInput v-model="draft.role" maxlength="120" class="w-full" />
        </UFormField>
        <UFormField label="Station">
          <UInput v-model="draft.station" maxlength="120" class="w-full" />
        </UFormField>
      </div>
      <UFormField label="Certifications" hint="Separate with commas">
        <UInput v-model="certifications" class="w-full" />
      </UFormField>
      <UFormField label="Experience notes">
        <UTextarea
          v-model="draft.notes"
          :rows="4"
          maxlength="1000"
          class="w-full"
        />
      </UFormField>
      <div class="flex justify-end gap-2">
        <UButton
          label="Start over"
          color="neutral"
          variant="ghost"
          type="button"
          @click="reset"
        />
        <UButton
          label="Add member"
          icon="i-lucide-user-plus"
          type="submit"
          :loading="creating"
          :disabled="!draft.name.trim()"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '#imports'
import { computed, ref } from 'vue'
import type { KitchenTeamDossierDraft } from '../../../models/team-dossier.model.ts'
import { useKitchenConsoleTeam } from '../../../composables/console/team/useKitchenConsoleTeam'
import { useKitchenTeamDossierOnboarding } from '../../../composables/console/team/useKitchenTeamDossierOnboarding'

const emit = defineEmits<{ created: [result: { name: string }] }>()
const { kitchenId } = useKitchenConsoleTeam()
const { extracting, creating, extractDossier, createFromDraft } =
  useKitchenTeamDossierOnboarding()
const toast = useToast()
const file = ref<File | null>(null)
const draft = ref<KitchenTeamDossierDraft | null>(null)
const certifications = computed({
  get: () => draft.value?.certifications.join(', ') || '',
  set: (value: string) => {
    if (!draft.value) return
    draft.value.certifications = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20)
  },
})

function selectFile(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0] || null
}

async function prepareDraft() {
  if (!file.value) return
  try {
    draft.value = await extractDossier(kitchenId.value, file.value)
  } catch (cause) {
    toast.add({
      title: 'Dossier could not be read',
      description: cause instanceof Error ? cause.message : 'Try another file.',
      color: 'error',
    })
  }
}

async function createMember() {
  if (!draft.value) return
  try {
    const result = await createFromDraft(kitchenId.value, draft.value)
    emit('created', result)
    reset()
  } catch (cause) {
    toast.add({
      title: 'Team member could not be added',
      description: cause instanceof Error ? cause.message : 'Try again.',
      color: 'error',
    })
  }
}

function reset() {
  file.value = null
  draft.value = null
}
</script>
