import {
  createError,
  defineEventHandler,
  getRouterParam,
} from 'h3'
import { laTapBerneMenuSections } from '../../data/menu'
import { laTapBerneMenuTheme } from '../../data/menu-theme'

const text = (value: unknown) => String(value ?? '').trim()
const slugPart = (value: unknown) =>
  text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
const priceNumber = (value: unknown) => {
  const parsed = Number(
    text(value)
      .replace(/chf/ig, '')
      .replace(',', '.')
      .match(/\d+(?:\.\d+)?/)?.[0] || 0
  )

  return Number.isFinite(parsed) ? parsed : 0
}

const ordering = {
  enabled: true,
  order_types: [
    {
      type: 'pre_order',
      notice_hours: 24,
      message:
        'Pre-orders need at least 24 hours notice. For normal service, please order at the bar or at your table.',
    },
  ],
}

const sections = () =>
  laTapBerneMenuSections.map((section, sectionIndex) => {
    const sectionId = slugPart(section.label) || `section-${sectionIndex + 1}`

    return {
      id: sectionId,
      label: section.label,
      items: section.items.map((item, itemIndex) => {
        const itemId = slugPart(item.name) || `${sectionId}-${itemIndex + 1}`

        return {
          id: itemId,
          dishId: '',
          name: item.name,
          description: item.description,
          imageUrl: '',
          price: priceNumber(item.price),
          priceLabel: item.price,
          priceOptions: (item.priceOptions ?? []).map((option) => ({
            ...option,
            priceLabel: String(option.price),
          })),
          addOns: (item.addOns ?? []).map((option) => ({
            ...option,
            priceLabel: String(option.price),
          })),
        }
      }),
    }
  })

export default defineEventHandler((event) => {
  const menuId = text(getRouterParam(event, 'menuId'))

  if (menuId !== 'main') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  return {
    kind: 'manifest',
    manifest: {
      content: {
        id: 'main',
        name: 'Comida Casera',
        description: 'Swiss Alpine Tapas',
        sections: sections(),
      },
      behaviour: {
        views: [],
        ordering,
        orderingEnabled: true,
        orderTypes: ['pre_order'],
        defaultOrderType: 'pre_order',
        defaultOrderTypeConfig: ordering.order_types[0],
        choices: [],
      },
      presentation: {
        kitchenName: 'La Tapberne',
        pageStyle: laTapBerneMenuTheme,
      },
    },
  }
})
