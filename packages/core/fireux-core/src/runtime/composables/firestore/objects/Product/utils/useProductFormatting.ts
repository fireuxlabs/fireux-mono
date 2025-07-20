import type {
  FirebaseProduct,
  Price,
} from '../../../../../models/product.model'
import { useMediaStorage } from '../../../../firebase/useMediaStorage'
import { useFirestoreManager } from '../../../useFirestoreManager'

export function useProductFormatting() {
  const { uploadImage } = useMediaStorage()
  const { checkUnique } = useFirestoreManager()

  /**
   * Format product data before saving
   */
  function formatProductData(
    product: Partial<FirebaseProduct>
  ): Partial<FirebaseProduct> {
    const formatted: Partial<FirebaseProduct> = { ...product }

    // Format name
    if (formatted.name) {
      formatted.name = formatted.name.trim()
    }

    // Format description
    if (formatted.description) {
      formatted.description = formatted.description.trim()
    }

    // Format slug
    if (formatted.slug) {
      formatted.slug = formatSlug(formatted.slug)
    }

    // Format arrays (remove empty strings and duplicates)
    if (formatted.features) {
      formatted.features = formatStringArray(formatted.features)
    }
    if (formatted.images) {
      formatted.images = formatted.images.filter((img) => img?.trim())
    }

    return formatted
  }

  /**
   * Build a tenant-prefixed slug and check if it's unique
   */
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
      return {
        success: false,
        message: `Slug "${slug}" is already taken.`,
      }
    }

    return { success: true, slug }
  }

  /**
   * Format slug to ensure it's URL-friendly
   */
  function formatSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Format product name for display
   */
  function formatProductName(product: FirebaseProduct): string {
    return product.name || 'Unnamed Product'
  }

  /**
   * Format product description with excerpt
   */
  function formatProductExcerpt(
    product: FirebaseProduct,
    maxLength: number = 150
  ): string {
    const description = product.description || ''
    if (description.length <= maxLength) return description

    return description.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  /**
   * Format price display
   */
  function formatPrice(price: Price): string {
    const currency = price.currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)
    const amount = (price.unit_amount / 100).toFixed(2)

    return `${symbol}${amount}`
  }

  /**
   * Format price range for product with multiple prices
   */
  function formatPriceRange(product: FirebaseProduct): string {
    if (!product.prices || product.prices.length === 0) {
      return 'Price not available'
    }

    if (product.prices.length === 1) {
      return formatPrice(product.prices[0])
    }

    const prices = product.prices
      .map((p) => p.unit_amount)
      .sort((a, b) => a - b)
    const minPrice = prices[0]
    const maxPrice = prices[prices.length - 1]

    const currency = product.prices[0].currency?.toUpperCase() || 'USD'
    const symbol = getCurrencySymbol(currency)

    return `${symbol}${(minPrice / 100).toFixed(2)} - ${symbol}${(maxPrice / 100).toFixed(2)}`
  }

  /**
   * Format product availability status
   */
  function formatAvailabilityStatus(product: FirebaseProduct): string {
    if (product.active === false) return 'Unavailable'
    if (product.metadata?.stock_quantity) {
      const stock = parseInt(product.metadata.stock_quantity)
      if (stock <= 0) return 'Out of Stock'
      if (stock <= 5) return 'Limited Stock'
    }
    return 'Available'
  }

  /**
   * Format product features for display
   */
  function formatFeatures(product: FirebaseProduct): string[] {
    return product.features?.filter((feature) => feature?.trim()) || []
  }

  /**
   * Upload and format product images
   */
  async function uploadProductImage(
    file: File,
    productSlug: string
  ): Promise<string | null> {
    try {
      const timestamp = Date.now()
      const filename = `products/${productSlug}/${timestamp}-${file.name}`
      // Note: Update uploadImage call based on actual function signature
      return await uploadImage(file, filename, 'products', productSlug)
    } catch (error) {
      console.error('Error uploading product image:', error)
      return null
    }
  }

  /**
   * Get currency symbol
   */
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

  /**
   * Helper function to format string arrays
   */
  function formatStringArray(arr: string[]): string[] {
    return [
      ...new Set(arr.filter((item) => item?.trim()).map((item) => item.trim())),
    ]
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
