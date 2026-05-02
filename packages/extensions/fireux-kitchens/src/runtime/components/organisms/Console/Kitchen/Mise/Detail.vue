<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/mise"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to mise
    </UButton>

    <MiseProfile v-if="profile" :model="profile" />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading mise task' : 'Mise task not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen mise task.'
          : `No mise task was found for ${miseId || 'this route'}.`
      "
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen mise detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMiseItem } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMiseItem'
import { useMiseEnPlaceInterface } from '../../../../../composables/fireux/firestore/runtime-kitchen/mise/utils/view/useMiseEnPlaceInterface'
import MiseProfile from '../../../Mise/Cards/Profile.vue'

const { profile: makeProfile } = useMiseEnPlaceInterface()
const { miseTask, miseId, pending, debug } = useKitchenConsoleMiseItem()
const profile = computed(() => makeProfile(miseTask.value))
const isDev = import.meta.dev
</script>
