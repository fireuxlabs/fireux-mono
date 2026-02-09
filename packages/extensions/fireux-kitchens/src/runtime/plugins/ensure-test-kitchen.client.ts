import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref, watch } from 'vue'
import { useFirestore } from 'vuefire'

export default defineNuxtPlugin(() => {
  const fireuxConfig = useFireUXConfig()
  if (!fireuxConfig.modules.includes('fireux-kitchens')) return

  const runtime = useRuntimeConfig()
  const kitchensConfig = (runtime.public as any)?.fireux?.kitchens ?? {}
  if (kitchensConfig.enabled === false) return
  if (kitchensConfig.ensureTestKitchen === false) return

  const db = useFirestore()
  const { uid } = useAuth()

  const ensuring = ref(false)
  const ensuredForUid = ref<string>('')

  const ensureForUser = async (userId: string) => {
    const id = String(userId || '').trim()
    if (!id) return
    if (ensuring.value) return
    if (ensuredForUid.value === id) return

    ensuring.value = true
    try {
      const placeRef = doc(db, 'places', id)
      const placeSnap = await getDoc(placeRef)
      let placeShouldBeTestKitchen = false

      if (!placeSnap.exists()) {
        placeShouldBeTestKitchen = true
        await setDoc(placeRef, {
          id,
          name: 'Test Kitchen',
          short_name: 'Test Kitchen',
          formatted_address: 'Test Kitchen',
          short_address: 'Test Kitchen',
          lat: 0,
          lng: 0,
          image_url: '',
          image_shade: 'none',
          claimed_by: id,
          source: 'manual',
          place_type: 'non_physical',
          is_test_kitchen: true,
          tags: ['test-kitchen'],
          search_term: 'test kitchen',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })
      } else {
        const placeData = (placeSnap.data() as any) ?? {}
        const claimedBy = String(placeData.claimed_by || '').trim()
        const isTestKitchen = placeData.is_test_kitchen === true
        const existingTags = Array.isArray(placeData.tags)
          ? placeData.tags.map((tag: unknown) => String(tag || '').trim()).filter(Boolean)
          : []
        const hasTestTag = existingTags.includes('test-kitchen')
        const placeName = String(placeData.name || '').trim().toLowerCase()
        const shortName = String(placeData.short_name || '').trim().toLowerCase()
        const isLikelyTestKitchen =
          placeName === 'test kitchen' ||
          shortName === 'test kitchen' ||
          String(placeData.id || '').trim() === id

        const shouldMarkAsTestKitchen = isTestKitchen || hasTestTag || isLikelyTestKitchen
        placeShouldBeTestKitchen = shouldMarkAsTestKitchen
        const patch: Record<string, unknown> = {}
        if (!claimedBy) patch.claimed_by = id
        if (shouldMarkAsTestKitchen && !hasTestTag) {
          patch.tags = [...existingTags, 'test-kitchen']
        }
        if (shouldMarkAsTestKitchen && !isTestKitchen) {
          patch.is_test_kitchen = true
        }

        if (Object.keys(patch).length) {
          await setDoc(
            placeRef,
            {
              ...patch,
              updated_at: serverTimestamp(),
            },
            { merge: true }
          )
        }
      }

      const kitchenRef = doc(db, 'kitchens', id)
      const kitchenSnap = await getDoc(kitchenRef)
      if (kitchenSnap.exists()) {
        const kitchenData = (kitchenSnap.data() as any) ?? {}
        if (placeShouldBeTestKitchen && kitchenData.is_test_kitchen !== true) {
          await setDoc(
            kitchenRef,
            {
              is_test_kitchen: true,
              updated_at: serverTimestamp(),
            },
            { merge: true }
          )
        }
      }

      ensuredForUid.value = id
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[fireux-kitchens] ensure test kitchen failed', {
          uid: id,
          error,
        })
      }
    } finally {
      ensuring.value = false
    }
  }

  watch(
    uid,
    (nextUid) => {
      const id = String(nextUid || '').trim()
      if (!id) return
      void ensureForUser(id)
    },
    { immediate: true }
  )
})
