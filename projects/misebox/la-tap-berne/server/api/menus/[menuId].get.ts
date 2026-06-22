import {
  createError,
  defineEventHandler,
  getRouterParam,
} from 'h3'
import { laTapBerneMenuSections } from '../../data/menu'

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
    page_style: {
      background_color_light: '#F4E8D2',
      background_color_dark: '#171717',
      font_color_light: '#1F1A14',
      font_color_dark: '#F7F1E6',
      title_color_light: '#1F1A14',
      title_color_dark: '#F7F1E6',
      primary_color: '#F0C84D',
      secondary_color: '#67C96F',
    },
    sections: laTapBerneMenuSections,
  }
})
