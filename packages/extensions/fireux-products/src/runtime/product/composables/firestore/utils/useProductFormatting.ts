import type { Product, ProductPrice } from '../../../utils/product.ts'
import { ProductStorage } from '../../../utils/product.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validate-public-slug'

export function useProductFormatting() {
  const { uploadImage } = useImageStorage()
  const { firestoreGetDoc } = useFirestoreRead()

  function formatProductData(product: Partial<Product>): Partial<Product> {
    const formatted: Partial<Product> = { ...product }

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
    _appId?: string
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
    const existing = await firestoreGetDoc(collectionName, slug)
    if (existing) {
      return { success: false, message: `Slug "${slug}" is already taken.` }
    }
    return { success: true, slug }
  }

  function formatProductName(product: Product): string {
    return product.name || 'Unnamed Product'
  }

  function formatProductExcerpt(product: Product, maxLength = 150): string {
    const description = product.description || ''
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  function formatPrice(price: ProductPrice): string {
    const currency = price.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)
    const amount = (price.unit_amount / 100).toFixed(2)
    return `${symbol}${amount}`
  }

  function formatAvailabilityStatus(product: Product): string {
    if (product.active === false) return 'Unavailable'
    return 'Available'
  }

  function formatFeatures(product: Product): string[] {
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
    formatAvailabilityStatus,
    formatFeatures,
    uploadProductImage,
    getCurrencySymbol,
  }
}
