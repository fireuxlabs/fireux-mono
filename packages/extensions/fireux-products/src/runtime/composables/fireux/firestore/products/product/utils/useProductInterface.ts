// Placeholder for product UI interfaces; extend when card/list props are defined
export interface ProductCardProps {
  id: string
  title: string
  slug?: string
  description?: string
  priceLabel?: string
}

export function useProductInterface() {
  const mapToCardProps = (
    product: Partial<ProductCardProps>
  ): ProductCardProps => ({
    id: product.id ?? 'product-id',
    title: product.title ?? 'Product',
    slug: product.slug,
    description: product.description,
    priceLabel: product.priceLabel,
  })

  return { mapToCardProps }
}
