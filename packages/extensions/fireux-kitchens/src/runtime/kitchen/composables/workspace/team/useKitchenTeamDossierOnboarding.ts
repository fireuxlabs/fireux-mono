import { ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import type { KitchenTeamDossierDraft } from '../../../models/team-dossier.model.ts'
import { useKitchenTeamMemberCreate } from './mutations/useKitchenTeamMemberCreate'

type DossierResponse = {
  ok: true
  draft: KitchenTeamDossierDraft
}

export function useKitchenTeamDossierOnboarding() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { createKitchenTeamMember } = useKitchenTeamMemberCreate()
  const extracting = ref(false)
  const creating = ref(false)

  async function extractDossier(kitchenId: string, file: File) {
    requireWritableData()
    extracting.value = true
    try {
      const user = await useRequireUser()
      const token = await user.getIdToken()
      const form = new FormData()
      form.append('file', file)
      const response = await $fetch<DossierResponse>(
        `/api/workspace/kitchen/team/dossier?kitchenId=${encodeURIComponent(kitchenId)}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      )
      return response.draft
    } finally {
      extracting.value = false
    }
  }

  async function createFromDraft(
    kitchenId: string,
    draft: KitchenTeamDossierDraft
  ) {
    requireWritableData()
    creating.value = true
    try {
      return await createKitchenTeamMember({ kitchenId, ...draft, jobTitle: draft.role })
    } finally {
      creating.value = false
    }
  }

  return { extracting, creating, extractDossier, createFromDraft }
}
