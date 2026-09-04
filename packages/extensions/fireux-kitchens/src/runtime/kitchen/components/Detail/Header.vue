<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UButton
        to="/kitchens"
        label="All Kitchens"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
      <div class="flex flex-wrap gap-3">
        <KitchenDetailSproochli
          v-if="kitchen.sproochli?.enabled"
          :sproochli="kitchen.sproochli"
        />
        <UButton
          v-if="canManage"
          :to="`/places/${encodeURIComponent(kitchen.id)}/edit`"
          label="Edit identity"
          icon="i-lucide-pencil"
          color="neutral"
          variant="soft"
        />
      </div>
    </div>
    <KitchenHeader :kitchen="kitchen" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.model.ts'

defineProps<{ kitchen: KitchenDetailPresentation }>()
const { isAdmin, isDeveloper } = useUserSession()
const canManage = computed(() => isAdmin.value || isDeveloper.value)
</script>
