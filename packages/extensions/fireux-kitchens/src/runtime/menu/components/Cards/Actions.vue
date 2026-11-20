<template>
  <nav class="menu-doorways" :aria-label="`${menuName || 'Menu'} options`">
    <UButton
      v-if="menuPath"
      :to="menuPath"
      icon="i-lucide-book-open"
      :size="display === 'icons' ? 'sm' : 'md'"
      :label="display === 'icons' ? undefined : 'View menu'"
      :aria-label="display === 'icons' ? 'View menu' : undefined"
      :title="display === 'icons' ? 'View menu' : undefined"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { normalizeSproochliLanguage } from 'fireux-sproochli/runtime/sproochli'
import {
  menuRoutePath,
  type MenuRouteScope,
} from '../../utils/navigation/route'

const props = withDefaults(
  defineProps<{
    menuId: string
    menuName?: string
    routeScope: MenuRouteScope
    display?: 'buttons' | 'icons'
  }>(),
  {
    menuName: '',
    display: 'buttons',
  }
)

const route = useRoute()
const selectedSproochliLanguage = computed(() =>
  normalizeSproochliLanguage(route.query.sproochli)
)
const preserveSproochliLanguage = (to: string) => {
  if (!to || !selectedSproochliLanguage.value) return to

  const [pathAndQuery = '', hash = ''] = to.split('#', 2)
  const [path, query = ''] = pathAndQuery.split('?', 2)
  const params = new URLSearchParams(query)
  params.set('sproochli', selectedSproochliLanguage.value)
  const nextQuery = params.toString()

  return `${path}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
}

const menuPath = computed(() =>
  preserveSproochliLanguage(
    menuRoutePath({ scope: props.routeScope, menuId: props.menuId })
  )
)
</script>

<style scoped>
.menu-doorways {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.6rem;
}

.menu-doorways:has(a[aria-label]) {
  flex-wrap: nowrap;
  justify-content: flex-end;
}

@media (max-width: 44rem) {
  .menu-doorways {
    justify-content: flex-start;
  }

  .menu-doorways :deep(a) {
    flex: 1 1 auto;
  }
}
</style>
