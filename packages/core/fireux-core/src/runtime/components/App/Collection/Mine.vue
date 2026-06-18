<template>
  <AppCollectionManager
    v-if="myApps.length"
    :collection="myApps"
    title="My apps"
    description="Apps you can access or administer."
    :show-search="false"
    :initial-variant="'cell'"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useAppCollection } from '../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import type { AppModel } from '../../../models/core/app.model'

const { coreUser } = useUser()
const { apps } = useAppCollection()

const myAppIds = computed(() =>
  Array.from(
    new Set(
      [
        ...(Array.isArray(coreUser.value?.userOf) ? coreUser.value.userOf : []),
        ...(Array.isArray(coreUser.value?.adminOf) ? coreUser.value.adminOf : []),
        ...(Array.isArray((coreUser.value as any)?.apps)
          ? (coreUser.value as any).apps
          : []),
      ]
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    )
  )
)
const myApps = computed<AppModel[]>(() => {
  if (!myAppIds.value.length) return []

  const ids = new Set(myAppIds.value)
  return (apps.value as AppModel[]).filter((app) =>
    ids.has(String(app.id ?? '').trim())
  )
})
</script>
