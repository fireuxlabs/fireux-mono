<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenTargetsLive</pre>

    <DevJson
      title="Kitchen live user debug"
      context="ConsoleKitchenTargetsLive · current user source"
      :data="userDebug"
      :default-open="true"
    />

    <KitchenCollectionManager
      :collection="collection"
      title="Choose Kitchen"
      description="Select the kitchen you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const { coreUser, appUser, pending } = useUser()
const userDebug = computed(() => ({
  pending: pending.value,
  coreUser: coreUser.value
    ? {
        id: coreUser.value.id,
        display_name: coreUser.value.display_name,
        adminOf: coreUser.value.adminOf,
        userOf: coreUser.value.userOf,
      }
    : null,
  appUser: appUser.value
    ? {
        id: appUser.value.id,
        role: appUser.value.role,
        is_premium: appUser.value.is_premium,
        console_enabled: appUser.value.console_enabled,
      }
    : null,
  kitchenConsoleSource: {
    myKitchens: coreUser.value?.myKitchens ?? [],
  },
}))
</script>
