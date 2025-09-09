import type { FirebaseProduct, Price } from '../../../../../models/objects/product.model'
import { useMediaStorage } from '../../../../firebase/useMediaStorage'
import { useFirestoreManager } from '../../../useFirestoreManager'

export function useProductFormatting() {
  const { uploadImage } = useMediaStorage()
  const { checkUnique } = useFirestoreManager()

  function formatSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/(^-)|(-$)/g, '')
  }

  function formatProductData(
    product: Partial<FirebaseProduct>
  ): Partial<FirebaseProduct> {
    const formatted: Partial<FirebaseProduct> = { ...product }

    if (formatted.name) formatted.name = formatted.name.trim()
    if (formatted.description) formatted.description = formatted.description.trim()
    if (formatted.slug) formatted.slug = formatSlug(formatted.slug)

    if (formatted.features) {
      formatted.features = formatGenericArray(formatted.features as any[])
    }
    if (formatted.images) {
      formatted.images = (formatted.images as any[]).filter((img: any) => {
        if (typeof img === 'string') return img.trim().length > 0
        return img && typeof img.url === 'string' && img.url.trim().length > 0
      }) as any
    }

    return formatted
  }

  async function buildSlugIfUnique(
    title: string,
    collectionName: string,
    tenantId?: string
  ): Promise<
    { success: true; slug: string } | { success: false; message: string }
  > {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const slug = tenantId ? `${tenantId}-${base}` : base
    const isTaken = await checkUnique(collectionName, 'slug', slug, true)
    if (isTaken) {
      return { success: false, message: `Slug "${slug}" is already taken.` }
    }
    return { success: true, slug }
  }

  function formatProductName(product: FirebaseProduct): string {
    return product.name || 'Unnamed Product'
  }

  function formatProductExcerpt(
    product: FirebaseProduct,
    maxLength: number = 150
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
    if (!product.prices || product.prices.length === 0) return 'Price not available'
  if (product.prices.length === 1 && product.prices[0]) return formatPrice(product.prices[0])

    const prices = (product.prices as Price[])
      .map((p: Price) => p?.unit_amount)
      .sort((a: number, b: number) => a - b)
    const minPrice = prices[0]
    const maxPrice = prices[prices.length - 1]

    const currency = (product.prices[0] as Price)?.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)
    if (minPrice == null || maxPrice == null) return 'Price not available'
    return `${symbol}${(minPrice / 100).toFixed(2)} - ${symbol}${(maxPrice / 100).toFixed(2)}`
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
    const feats: any[] = (product.features as any[]) || []
    return feats
      .map((f: any) => (typeof f === 'string' ? f : f?.label))
      .filter((label: any) => typeof label === 'string' && label.trim().length)
  }

  async function uploadProductImage(
    file: File,
    productSlug: string
  ): Promise<string | null> {
    try {
      const timestamp = Date.now()
      const filename = `products/${productSlug}/${timestamp}-${file.name}`
      return await uploadImage(file, filename, 'products', productSlug)
    } catch (error) {
      console.error('Error uploading product image:', error)
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
    return symbols[currency] || currency + ' '
  }

  function formatGenericArray(arr: any[]): any[] {
    if (!Array.isArray(arr)) return []
    if (arr.length === 0) return []
    if (typeof arr[0] === 'string') {
      return [...new Set(arr.filter((s: string) => s?.trim()).map((s: string) => s.trim()))]
    }
    if (arr[0] && typeof arr[0].label === 'string') {
      // Normalize label trimming and de-duplicate by label
      const seen = new Set<string>()
      const out: any[] = []
      for (const item of arr) {
        const label = String(item.label || '').trim()
        if (!label || seen.has(label)) continue
        seen.add(label)
        out.push({ ...item, label })
      }
      return out
    }
    return arr
  }

  return {
    formatProductData,
    buildSlugIfUnique,
    formatSlug,
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
