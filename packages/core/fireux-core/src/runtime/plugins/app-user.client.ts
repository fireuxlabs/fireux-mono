// packages/core/fireux-core/src/runtime/plugins/app-user.client.ts
import { defineNuxtPlugin, useState } from 'nuxt/app'
import { watch } from 'vue'
import type { AppUser } from '../models/core/appUser.model'
import { useAppUser } from '../composables/firestore/AppUser/useAppUser'

export default defineNuxtPlugin(async () => {
  const { appUser } = await useAppUser()

  const appUserState = useState<AppUser | null>('appUser', () => null)

  watch(
    appUser,
    (v) => {
      appUserState.value = v ?? null
    },
    { immediate: true }
  )
})
