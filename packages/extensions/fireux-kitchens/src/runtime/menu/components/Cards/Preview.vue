<template>
  <UCard
    as="article"
    class="menu-card-preview rounded-2xl"
    :ui="{ body: 'p-5 sm:p-6' }"
    data-menu-card-preview
  >
    <div
      class="flex flex-col gap-4"
    >
      <div class="flex min-w-0 items-start gap-4">
        <UAvatar
          v-if="routeScope.kind !== 'directory'"
          :class="avatarClass"
          :src="kitchenImageUrl || undefined"
          :alt="kitchenName || menuName"
          size="lg"
        />
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-elevated text-toned"
        >
          <UIcon name="i-lucide-book-open" class="size-5" aria-hidden="true" />
        </div>
        <div class="min-w-0 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-xl font-semibold tracking-tight text-highlighted">
              {{ menuName }}
            </h3>
          </div>
          <p
            v-if="kitchenName && routeScope.kind !== 'directory'"
            class="text-sm text-toned"
          >
            {{ kitchenName }}
          </p>
          <p
            v-if="menuDescription && menuDescription !== kitchenName"
            class="max-w-prose text-sm leading-relaxed text-muted"
          >
            {{ menuDescription }}
          </p>
          <KitchenDetailOfferingTimes
            :offerings="menu.offerings || []"
            :empty-message="
              menu.source?.kitchen_id
                ? 'Serving times have not been published.'
                : ''
            "
            compact
          />
        </div>
      </div>
      <MenuDoorways
        class="shrink-0"
        :offerings="menuOfferings"
        :menu-id="routeScope.kind === 'root' ? menu.id : menu.slug || ''"
        :menu-name="menuName"
        :route-scope="routeScope"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuCardPresentation } from '../../composables/useMenuCardPresentation'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response.ts'
import type { MenuRouteScope } from '../../../kitchen/utils/kitchen-menu-route'

const props = defineProps<{
  menu: MenuDirectoryEntry
  routeScope: MenuRouteScope
}>()

const {
  avatarClass,
  kitchenImageUrl,
  kitchenName,
  menuOfferings,
  menuDescription,
  menuName,
} = useMenuCardPresentation(
  computed(() => props.menu),
  computed(() => props.routeScope)
)
</script>

<style scoped>
.menu-card-preview {
  min-width: 0;
}
</style>
