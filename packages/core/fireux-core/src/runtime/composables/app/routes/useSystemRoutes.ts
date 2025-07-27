import type { RouteLink } from '../../../types/routeLink'

export function useSystemRoutes(): RouteLink[] {
  return [
    { id: 'home', label: 'Home', icon: 'i-lucide-home', to: '/' },
    {
      id: 'products',
      label: 'Products',
      icon: 'i-lucide-box',
      to: '/products',
    },
    { id: 'blog', label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
  ]
}
