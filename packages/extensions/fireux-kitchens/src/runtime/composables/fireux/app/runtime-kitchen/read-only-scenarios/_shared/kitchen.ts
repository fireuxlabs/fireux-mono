import { KitchenCollection, type Kitchen } from '../../../../../../models/kitchen.model'

type CreateReadOnlyKitchenParams = {
  id: string
  name: string
  shortName?: string
  shortAddress?: string
  formattedAddress?: string
  imageUrl?: string
}

export const createReadOnlyKitchen = (params: CreateReadOnlyKitchenParams): Kitchen => ({
  ...KitchenCollection,
  id: String(params.id || '').trim(),
  is_test_kitchen: true,
  name: String(params.name || '').trim(),
  short_name: String(params.shortName || params.name || '').trim(),
  short_address: String(params.shortAddress || params.name || '').trim(),
  formatted_address: String(params.formattedAddress || params.name || '').trim(),
  image_url: String(params.imageUrl || '').trim(),
  image_shade: 'none',
  source: 'read-only-scenario' as any,
  lat: 0,
  lng: 0,
})
