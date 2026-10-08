import type { WatchSource } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import type { KitchenUpdateInput } from '../../models/kitchen-input.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()

/** Kitchen roots are server-owned; every edit crosses the fixed trusted seam. */
export function useKitchenUpdate(sources: WatchSource[] = []) {
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const route = useRoute()
  const capture = useCommandScope([
    () => currentUser.value?.uid,
    session.appUser,
    () => config.appId,
    () => route.path,
    ...sources,
  ])
  async function updateKitchen(input: {
    kitchenId: string
    changes: KitchenUpdateInput
  }) {
    const id = clean(input.kitchenId)
    if (!id) throw new Error('Kitchen id is required.')
    const uid = currentUser.value?.uid
    const changes: KitchenUpdateInput = JSON.parse(
      JSON.stringify(input.changes)
    )
    const isCurrent = capture()
    const assertCurrent = () => {
      if (!uid || !isCurrent())
        throw new Error(
          'The Kitchen or account context changed. Please try again.'
        )
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ ok: true; kitchen_id: string }>(
      '/api/workspace/kitchen/update',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchen_id: id, patch: changes },
      }
    )
    if (result.ok !== true || result.kitchen_id !== id) {
      throw new Error('Kitchen update response was invalid.')
    }
  }

  async function publishKitchen(input: { kitchenId: string; slug: string }) {
    const slug = validatePublicSlug(input.slug, {
      label: 'Kitchen slug',
      reservedScope: 'root',
    })
    if (!slug.isValid) {
      throw new Error(slug.message || 'Kitchen slug is not valid.')
    }

    await updateKitchen({
      kitchenId: input.kitchenId,
      changes: { 'identity.slug': slug.slug, 'identity.visibility': true },
    })
  }

  async function unpublishKitchen(kitchenId: string) {
    await updateKitchen({
      kitchenId,
      changes: { 'identity.visibility': false },
    })
  }

  return {
    updateKitchen,
    publishKitchen,
    unpublishKitchen,
    captureIntent: capture,
  }
}
