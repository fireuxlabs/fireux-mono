// packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts

export function useCoreRoutes() {
  const systemRoutes = useSystemRoutes()
  const { hasCoreProfile, isAdmin } = useUser()

  const links = computed(() => [
    ...systemRoutes,
    ...(hasCoreProfile.value ? useUserRoutes() : []),
    ...(isAdmin.value ? useAdminRoutes() : []),
  ])

  return { links }
}
