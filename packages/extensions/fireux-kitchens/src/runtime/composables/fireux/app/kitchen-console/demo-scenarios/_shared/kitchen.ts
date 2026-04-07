import { KitchenModel, type Kitchen } from '../../../../../../models/kitchen.model'

type CreateDemoKitchenParams = {
  id: string
  name: string
  shortName?: string
  shortAddress?: string
  formattedAddress?: string
  imageUrl?: string
}

export const createDemoKitchen = (params: CreateDemoKitchenParams): Kitchen => {
  const id = String(params.id || '').trim()
  const imageUrl = String(params.imageUrl || '').trim()

  return {
    ...KitchenModel,
    id,
    is_test_kitchen: false,
    name: String(params.name || '').trim(),
    short_name: String(params.shortName || params.name || '').trim(),
    short_address: String(params.shortAddress || '').trim(),
    formatted_address: String(params.formattedAddress || '').trim(),
    image_url: imageUrl,
    image_shade: 'none',
    source: 'demo-scenario' as any,
    lat: 0,
    lng: 0,
  }
}
