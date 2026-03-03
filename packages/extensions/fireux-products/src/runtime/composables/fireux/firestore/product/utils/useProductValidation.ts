import { useRuntimeConfig } from '#imports'
import type { FirebaseProduct } from '../../../../../models/product.model'

export function useProductValidation() {
  function validateProduct(product: Partial<FirebaseProduct>) {
    const errors: string[] = []

    if (!product.name?.trim()) {
      errors.push('Product name is required')
    }

    if (!product.description?.trim()) {
      errors.push('Product description is required')
    }

    if (!product.slug?.trim()) {
      errors.push('Product slug is required')
    }

    if (product.name && product.name.length > 200) {
      errors.push('Product name must be 200 characters or less')
    }

    if (product.description && product.description.length > 1000) {
      errors.push('Product description must be 1000 characters or less')
    }

    if (product.slug && !isValidSlug(product.slug)) {
      errors.push(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      )
    }

    if (product.prices && product.prices.length === 0) {
      errors.push('At least one price is required')
    }

    if (product.images) {
      for (const image of product.images) {
        const url = typeof image === 'string' ? image : image.url
        if (!isValidUrl(url)) {
          errors.push('All product images must be valid URLs')
          break
        }
      }
    }

    if (product.features && product.features.length > 20) {
      errors.push('Maximum 20 features allowed')
    }

    if (product.metadata && typeof product.metadata !== 'object') {
      errors.push('Metadata must be an object')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  function isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && price < 999_999_999
  }

  function isValidProductType(type: string): boolean {
    const cfg = (useRuntimeConfig().public as any)?.fireux?.products ?? {}
    const allowed = Array.isArray(cfg.productKinds) ? cfg.productKinds : []
    if (allowed.length) return allowed.includes(type)
    const fallback = ['physical', 'digital', 'service', 'subscription']
    return fallback.includes(type)
  }

  return {
    validateProduct,
    isValidSlug,
    isValidUrl,
    isValidPrice,
    isValidProductType,
  }
}
