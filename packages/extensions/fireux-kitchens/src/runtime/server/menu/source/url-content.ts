import { defaultMenuLanguageText } from '../language/default-text'

export type KitchenMenuUrlContent = {
  provider: string
  source_url: string
  resolved_url: string
  text: string
  metadata: Record<string, unknown>
}

const text = (value: unknown) => String(value ?? '').trim()

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const rows = (value: unknown) => (Array.isArray(value) ? value.map(record) : [])

const money = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const pageText = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)))

const foodBookingIds = (html: string) =>
  unique([
    ...[...html.matchAll(/data-glf-ruid=["']([^"']+)["']/g)].map((match) =>
      text(match[1])
    ),
    ...[...html.matchAll(/restaurant_uid["']?\s*[:=]\s*["']([^"']+)["']/g)].map(
      (match) => text(match[1])
    ),
  ])

const optionGroupSummary = (value: unknown) =>
  rows(value)
    .map((group) => ({
      name: defaultMenuLanguageText(group.name),
      required: Boolean(group.required),
      options_count: rows(group.options).length,
    }))
    .filter((group) => group.name || group.options_count)

const sizeRows = (item: Record<string, unknown>) => {
  const basePrice = money(item.price)

  return rows(item.sizes)
    .map((size) => {
      const priceDelta = money(size.price)

      return {
        label: defaultMenuLanguageText(size.name),
        price: priceDelta ? basePrice + priceDelta : basePrice,
      }
    })
    .filter((size) => size.label)
}

const itemImageUrl = (item: Record<string, unknown>) =>
  text(item.image_url) ||
  text(item.imageUrl) ||
  text(item.picture_url) ||
  text(item.pictureUrl) ||
  text(item.photo_url) ||
  text(item.photoUrl) ||
  text(item.image) ||
  text(item.picture) ||
  text(item.photo)

const foodBookingPayload = (data: unknown) => {
  const root = record(data)
  const restaurant = record(root.restaurant || record(root.data).restaurant)
  const menu = record(restaurant.menu || root.menu)
  const categories = rows(menu.categories)

  return {
    provider: 'foodbooking',
    restaurant: {
      id: text(restaurant.id),
      uid: text(restaurant.uid),
      name: defaultMenuLanguageText(restaurant.name),
    },
    menu: {
      id: text(menu.id),
      name: defaultMenuLanguageText(menu.name),
      currency: text(menu.currency),
    },
    sections: categories
      .map((category) => ({
        id: text(category.id),
        name: defaultMenuLanguageText(category.name),
        description: defaultMenuLanguageText(category.description),
        items: rows(category.items)
          .filter((item) => item.active !== false)
          .map((item) => ({
            id: text(item.id),
            name: defaultMenuLanguageText(item.name),
            description: defaultMenuLanguageText(item.description),
            image_url: itemImageUrl(item),
            price: money(item.price),
            tags: Array.isArray(item.tags)
              ? item.tags.map(text).filter(Boolean)
              : [],
            sizes: sizeRows(item),
            modifier_groups: optionGroupSummary(item.groups),
          }))
          .filter((item) => item.name),
      }))
      .filter((section) => section.name || section.items.length),
  }
}

const foodBookingText = (input: {
  sourceUrl: string
  restaurantUid: string
  data: unknown
}) => {
  const payload = foodBookingPayload(input.data)

  return [
    'Resolved restaurant ordering menu data.',
    `Provider: FoodBooking`,
    `Source URL: ${input.sourceUrl}`,
    `Restaurant UID: ${input.restaurantUid}`,
    'Use sections as menu sections and items as dishes.',
    'Treat modifier_groups as add-ons, not standalone dishes.',
    'Treat sizes as dish price variants.',
    JSON.stringify(payload, null, 2),
  ].join('\n')
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'FireUX menu source resolver',
    },
  })
  const body = await response.text()

  return { response, body }
}

async function fetchFoodBookingMenu(sourceUrl: string, restaurantUid: string) {
  const response = await fetch('https://www.foodbooking.com/api/cart/init', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'FireUX menu source resolver',
    },
    body: JSON.stringify({
      restaurant_uid: restaurantUid,
      payload: {
        language_code: 'de',
        init: 1,
        source: 'website',
        reference: null,
      },
      return_url: encodeURIComponent(sourceUrl),
    }),
  })
  const data = await response.json()

  return { response, data }
}

export async function resolveKitchenMenuUrlContent(
  sourceUrl: string
): Promise<KitchenMenuUrlContent> {
  const { response, body } = await fetchText(sourceUrl)
  const ids = foodBookingIds(body)
  const restaurantUid = ids[0]

  if (restaurantUid) {
    const foodBooking = await fetchFoodBookingMenu(sourceUrl, restaurantUid)
    const payload = foodBookingPayload(foodBooking.data)
    const sections = Array.isArray(payload.sections) ? payload.sections : []
    const itemsCount = sections.reduce(
      (count, section) => count + section.items.length,
      0
    )

    if (foodBooking.response.ok && itemsCount) {
      return {
        provider: 'foodbooking',
        source_url: sourceUrl,
        resolved_url: 'https://www.foodbooking.com/api/cart/init',
        text: foodBookingText({
          sourceUrl,
          restaurantUid,
          data: foodBooking.data,
        }),
        metadata: {
          restaurant_uid: restaurantUid,
          sections_count: sections.length,
          items_count: itemsCount,
          restaurant_name: payload.restaurant.name,
          menu_name: payload.menu.name,
        },
      }
    }
  }

  return {
    provider: 'html',
    source_url: sourceUrl,
    resolved_url: response.url || sourceUrl,
    text: response.ok ? pageText(body) : `URL returned ${response.status}.`,
    metadata: {
      status: response.status,
      foodbooking_ids: ids,
    },
  }
}
