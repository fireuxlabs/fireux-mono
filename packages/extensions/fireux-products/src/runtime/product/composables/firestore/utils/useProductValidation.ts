import { useRuntimeConfig } from '#imports'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  ProductStorage,
  type FirebaseProduct,
} from '../../../models/product.model.ts'

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

    if (product.slug) {
      const slugValidation = validatePublicSlug(product.slug, {
        label: 'Product slug',
        namespace: ProductStorage.collection,
        reservedScope: 'entity',
      })
      if (!slugValidation.isValid) {
        errors.push(slugValidation.message || 'Product slug is invalid')
      }
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

    return {
      isValid: errors.length === 0,
      errors,
    }
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
    isValidUrl,
    isValidPrice,
    isValidProductType,
  }
}
