import { computed, type ComputedRef } from 'vue'
import { useUserCollection } from '../firestore/core/user/main/useUserCollection.ts'
import { useProducts } from '../firestore/objects/Product/useProducts.ts'
import { useBlogPosts } from '../firestore/objects/Blog/useBlogPosts.ts'
import type { FirebaseProduct } from '../../models/objects/product.model.ts'
import type { BlogPost } from '../../models/objects/blogPost.model.ts'

export interface AdminMetrics {
  totalUsers: ComputedRef<number>
  totalProducts: ComputedRef<number>
  activeProducts: ComputedRef<number>
  outOfStockProducts: ComputedRef<number>
  totalPosts: ComputedRef<number>
  articlePosts: ComputedRef<number>
  productPosts: ComputedRef<number>
}

/**
 * Aggregate admin-facing metrics pulled from existing Firestore composables.
 */
export async function useAdminMetrics(): Promise<AdminMetrics> {
  const { users } = useUserCollection()
  const { productsCollection } = useProducts()
  const { blogPostsCollection } = await useBlogPosts()

  const totalUsers = computed(() => users.value?.length ?? 0)

  const totalProducts = computed(() => productsCollection.value?.length ?? 0)

  const activeProducts = computed(() => {
    const products = productsCollection.value ?? []
    return products.filter((product) => product?.active !== false).length
  })

  const outOfStockProducts = computed(() => {
    const products = (productsCollection.value ?? []) as FirebaseProduct[]
    return products.filter((product) => {
      if (!product) return false
      if (!product.track_stock) return false
      return Number(product.stock ?? 0) === 0
    }).length
  })

  const totalPosts = computed(() => (blogPostsCollection.value ?? []).length)

  const articlePosts = computed(() => {
    const posts = (blogPostsCollection.value ?? []) as BlogPost[]
    return posts.filter((post) => post?.type === 'article').length
  })

  const productPosts = computed(() => {
    const posts = (blogPostsCollection.value ?? []) as BlogPost[]
    return posts.filter((post) => post?.type === 'product').length
  })

  return {
    totalUsers,
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalPosts,
    articlePosts,
    productPosts,
  }
}
