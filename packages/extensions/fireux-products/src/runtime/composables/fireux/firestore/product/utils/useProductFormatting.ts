import type {
  FirebaseProduct,
  Price,
} from '../../../../../models/product.model'
import { ProductStorage } from '../../../../../models/product.model'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'

export function useProductFormatting() {
  const { uploadImage } = useImageStorage()
  const { firestoreFetchDoc } = useFirestoreManager()

  function formatProductData(
    product: Partial<FirebaseProduct>
  ): Partial<FirebaseProduct> {
    const formatted: Partial<FirebaseProduct> = { ...product }

    if (formatted.name) formatted.name = formatted.name.trim()
    if (formatted.description)
      formatted.description = formatted.description.trim()
    if (formatted.slug) formatted.slug = normalizeSlug(formatted.slug)

    if (formatted.features) {
      formatted.features = formatGenericArray(formatted.features as any[])
    }
    if (formatted.images) {
      formatted.images = (formatted.images as any[]).filter((image: any) => {
        if (typeof image === 'string') return image.trim().length > 0
        return (
          image && typeof image.url === 'string' && image.url.trim().length > 0
        )
      }) as any
    }

    return formatted
  }

  async function buildSlugIfUnique(
    title: string,
    collectionName: string,
    _tenantId?: string
  ): Promise<
    { success: true; slug: string } | { success: false; message: string }
  > {
    const validation = validatePublicSlug(title, {
      label: 'Product slug',
      namespace: ProductStorage.collection,
      reservedScope: 'entity',
    })

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message || 'Product slug is invalid',
      }
    }

    const slug = validation.slug
    const existing = await firestoreFetchDoc(collectionName, slug)
    if (existing) {
      return { success: false, message: `Slug "${slug}" is already taken.` }
    }
    return { success: true, slug }
  }

  function formatProductName(product: FirebaseProduct): string {
    return product.name || 'Unnamed Product'
  }

  function formatProductExcerpt(
    product: FirebaseProduct,
    maxLength = 150
  ): string {
    const description = product.description || ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  function formatPrice(price: Price): string {
    const currency = price.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)
    const amount = (price.unit_amount / 100).toFixed(2)
    return `${symbol}${amount}`
  }

  function formatPriceRange(product: FirebaseProduct): string {
    if (!product.prices || product.prices.length === 0)
      return 'Price not available'
    if (product.prices.length === 1) {
      const onlyPrice = product.prices[0]
      return onlyPrice ? formatPrice(onlyPrice) : 'Price not available'
    }

    const amounts = product.prices
      .map((price: Price | undefined) =>
        price ? price.unit_amount : undefined
      )
      .filter((value: unknown): value is number => typeof value === 'number')
      .sort((a: number, b: number) => a - b)

    const minPrice = amounts[0]
    const maxPrice = amounts[amounts.length - 1]
    const currency = product.prices[0]?.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)

    if (minPrice === undefined || maxPrice === undefined) {
      return 'Price not available'
    }

    return `${symbol}${(minPrice / 100).toFixed(2)} - ${symbol}${(
      maxPrice / 100
    ).toFixed(2)}`
  }

  function formatAvailabilityStatus(product: FirebaseProduct): string {
    if (product.active === false) return 'Unavailable'
    if ((product as any).metadata?.stock_quantity) {
      const stock = parseInt((product as any).metadata.stock_quantity)
      if (stock <= 0) return 'Out of Stock'
      if (stock <= 5) return 'Limited Stock'
    }
    return 'Available'
  }

  function formatFeatures(product: FirebaseProduct): string[] {
    const features: any[] = (product.features as any[]) || []
    return features
      .map((feature: any) =>
        typeof feature === 'string' ? feature : feature?.label
      )
      .filter((label: any) => typeof label === 'string' && label.trim().length)
  }

  async function uploadProductImage(
    file: File,
    productSlug: string
  ): Promise<string | null> {
    try {
      const timestamp = Date.now()
      const path = `${ProductStorage.collection}/${productSlug}/${timestamp}-${file.name}`
      return await uploadImage(path, file)
    } catch (error) {
      console.error('[fireux] failed to upload product image', error)
      return null
    }
  }

  function getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
    }
    return symbols[currency] || `${currency} `
  }

  function formatGenericArray(arr: any[]): any[] {
    if (!Array.isArray(arr) || arr.length === 0) return []
    if (typeof arr[0] === 'string') {
      return [
        ...new Set(
          arr
            .filter((value: string) => value?.trim())
            .map((value: string) => value.trim())
        ),
      ]
    }
    if (arr[0] && typeof arr[0].label === 'string') {
      const seen = new Set<string>()
      const output: any[] = []
      for (const item of arr) {
        const label = String(item.label || '').trim()
        if (!label || seen.has(label)) continue
        seen.add(label)
        output.push({ ...item, label })
      }
      return output
    }
    return arr
  }

  return {
    formatProductData,
    buildSlugIfUnique,
    formatProductName,
    formatProductExcerpt,
    formatPrice,
    formatPriceRange,
    formatAvailabilityStatus,
    formatFeatures,
    uploadProductImage,
    getCurrencySymbol,
  }
}
