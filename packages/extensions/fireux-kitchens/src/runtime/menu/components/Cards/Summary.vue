<template>
  <UCard as="article" class="menu-card-preview" data-menu-card-preview>
    <div class="fx-card-body-stack">
      <div class="card__media">
        <UAvatar
          v-if="routeScope.kind !== 'directory'"
          :class="avatarClass"
          :src="kitchenImageUrl || undefined"
          :alt="kitchenName || menuName"
          size="lg"
        />
        <div v-else>
          <UIcon name="i-lucide-book-open" aria-hidden="true" />
        </div>
        <div class="fx-card-body-stack">
          <div>
            <h3>
              {{ menuName }}
            </h3>
          </div>
          <p v-if="kitchenName && routeScope.kind !== 'directory'">
            {{ kitchenName }}
          </p>
          <p v-if="menuDescription && menuDescription !== kitchenName">
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
      <MenuCardsActions
        :offerings="menuOfferings"
        :menu-id="menu.slug || menu.source?.menu_slug || ''"
        :menu-name="menuName"
        :route-scope="effectiveRouteScope"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuCardPresentation } from '../../composables/useMenuCardPresentation'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response.ts'
import type { MenuRouteScope } from '../../utils/navigation/route'

const props = defineProps<{
  menu: MenuDirectoryEntry
  routeScope: MenuRouteScope
}>()

const {
  effectiveRouteScope,
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
