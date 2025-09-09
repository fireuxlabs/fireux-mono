import { defineNuxtPlugin, useState } from 'nuxt/app'
import { watch } from 'vue'
import type { AppUser } from '../models/core/appUser.model'
import { useAppUser } from '../composables/firestore/AppUser/useAppUser'

export default defineNuxtPlugin(async () => {
  const { appUser, appUsers } = await useAppUser()

  const appUserState = useState<AppUser | null>('appUser', () => null)
  const appUsersState = useState<AppUser[]>('appUsers', () => [])

  watch(
    appUser,
    (v) => {
      appUserState.value = v ?? null
    },
    { immediate: true }
  )

  if (Array.isArray(appUsers)) appUsersState.value = appUsers
})
