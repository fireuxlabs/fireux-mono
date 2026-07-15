<script setup lang="ts">
import { kitchenMenuPath } from 'fireux-kitchens/runtime/utils/kitchen-menu-route'
import {
  menuContextualMenuId,
  normalizeMenuRouteContext,
} from 'fireux-kitchens/runtime/utils/menu-context'

const route = useRoute()
const context = normalizeMenuRouteContext(route.query.context)
const menuId = context === 'generic'
  ? ''
  : menuContextualMenuId('pizza-snacks-drinks', context)
const target = menuId
  ? kitchenMenuPath({
      mode: 'single-kitchen-app',
      kitchenSlug: '',
      menuId,
    })
  : '/menus'

await navigateTo(target, {
  redirectCode: 301,
  replace: true,
})
</script>
