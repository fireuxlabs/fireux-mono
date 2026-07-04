import {
  createError,
  defineEventHandler,
  getRouterParam,
} from 'h3'
import { laTapBerneMenuSections } from '../../data/menu'
import { laTapBerneMenuTheme } from '../../data/menu-theme'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler((event) => {
  const menuId = text(getRouterParam(event, 'menuId'))

  if (menuId !== 'main') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  return {
    id: 'main',
    slug: 'main',
    name: 'Comida Casera',
    description: 'Swiss Alpine Tapas',
    kind: 'menu',
    kitchen: {
      id: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
      slug: 'la-tapberne',
      name: 'La Tapberne',
    },
    app: {
      id: 'la-tap-berne',
      name: 'La Tap Berne',
    },
    path: '/menu',
    api_path: '/api/menus/main',
    // Tenant menu API spine: emit the same service profile that Misebox public menus consume.
    ordering: {
      enabled: true,
      order_types: [
        {
          type: 'pre_order',
          notice_hours: 24,
          message:
            'Pre-orders need at least 24 hours notice. For normal service, please order at the bar or at your table.',
        },
      ],
    },
    page_style: laTapBerneMenuTheme,
    sections: laTapBerneMenuSections,
  }
})
