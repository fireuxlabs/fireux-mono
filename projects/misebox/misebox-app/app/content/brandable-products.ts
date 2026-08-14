export type BrandOwnerType = 'app' | 'kitchen'

export type BrandableProductTreatment = {
  id: string
  owner: { type: BrandOwnerType; id: string; name: string }
  image: string
  status: 'approved' | 'example'
}

export type BrandableProduct = {
  id: string
  name: string
  role: string
  neutralImage: string
  brandingSurfaces: { id: string; accepts: readonly ('wordmark' | 'mark')[] }[]
  treatments: BrandableProductTreatment[]
  commerce: {
    unit: string
    minimumQuantity: number
    orderIncrement: number
  }
}

export const servingCartonProduct: BrandableProduct = {
  id: 'serving-carton',
  name: 'Serving carton',
  role: 'packaging.serving_carton',
  neutralImage: '/img/products/serving-carton/neutral.png',
  brandingSurfaces: [
    { id: 'front-panel', accepts: ['wordmark', 'mark'] },
  ],
  treatments: [
    {
      id: 'friiites-serving-carton',
      owner: { type: 'app', id: 'friiites', name: 'Friiites' },
      image: '/img/products/serving-carton/friiites.webp',
      status: 'approved',
    },
  ],
  commerce: {
    unit: 'carton',
    minimumQuantity: 1000,
    orderIncrement: 1000,
  },
}
