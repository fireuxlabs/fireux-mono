<template>
  <UPageGrid as="ul" aria-label="Users">
    <li v-for="row in rows" :key="row.id">
      <FireCollectionCell :cell="row.cell" />
    </li>
  </UPageGrid>
  <FireDiagnosticsDebugPanel
    title="Users collection surface"
    context="Passed Users and their final shared cell projection."
    object-origin="passed"
    :objects="{ users: props.users }"
    :derived="{ rows }"
    launcher
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import FireCollectionCell from '../../../components/Collection/Cell.vue'
import type { CollectionCellData } from '../../../types/collection-cell'
import type { User } from '../../models/user.model'
import { useUserView } from '../../composables/useUserView'

const props = defineProps<{ users: User[] }>()
const { toView } = useUserView()
const rows = computed<Array<{ id: string; cell: CollectionCellData }>>(() =>
  props.users.flatMap((user) => {
    const view = toView(user)
    if (!view) return []
    return [
      {
        id: user.id,
        cell: {
          title: user.display_name,
          description: user.bio,
          image: view.avatarUrl,
          imageText: user.display_name.slice(0, 2).toUpperCase(),
          imageStyle: 'avatar' as const,
          meta: view.handleLabel,
          to: view.to,
        },
      },
    ]
  })
)
</script>
