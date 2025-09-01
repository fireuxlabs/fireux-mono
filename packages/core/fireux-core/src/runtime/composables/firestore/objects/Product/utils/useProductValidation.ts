import type { FirebaseProduct } from '../../../../../models/objects/product.model'

export function useProductValidation() {
  /**
   * Validate product data
   */
  function validateProduct(product: Partial<FirebaseProduct>) {
    const errors: string[] = []

    // Required fields
    if (!product.name?.trim()) {
      errors.push('Product name is required')
    }

    if (!product.description?.trim()) {
      errors.push('Product description is required')
    }

    if (!product.slug?.trim()) {
      errors.push('Product slug is required')
    }

    // Name validation
    if (product.name && product.name.length > 200) {
      errors.push('Product name must be 200 characters or less')
    }

    // Description validation
    if (product.description && product.description.length > 1000) {
      errors.push('Product description must be 1000 characters or less')
    }

    // Slug validation
    if (product.slug && !isValidSlug(product.slug)) {
      errors.push(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      )
    }

    // Price validation
    if (product.prices && product.prices.length === 0) {
      errors.push('At least one price is required')
    }

    // Image validation
    if (product.images) {
      for (const image of product.images) {
        const url = typeof image === 'string' ? image : image.url
        if (!isValidUrl(url)) {
          errors.push('All product images must be valid URLs')
          break
        }
      }
    }

    // Features validation
    if (product.features && product.features.length > 20) {
      errors.push('Maximum 20 features allowed')
    }

    // Metadata validation
    if (product.metadata) {
      if (typeof product.metadata !== 'object') {
        errors.push('Metadata must be an object')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate slug format
   */
  function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  /**
   * Validate URL format
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate price value
   */
  function isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && price < 999999999
  }

  /**
   * Validate product type
   */
  function isValidProductType(type: string): boolean {
    const validTypes = ['physical', 'digital', 'service', 'subscription']
    return validTypes.includes(type)
  }

  return {
    validateProduct,
    isValidSlug,
    isValidUrl,
    isValidPrice,
    isValidProductType,
  }
}
