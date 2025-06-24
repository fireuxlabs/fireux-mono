export function useSystemRoutes() {
  return [
    { label: 'Home', icon: 'i-lucide-home', to: '/' },
    { label: 'Products', icon: 'i-lucide-box', to: '/products' },
    { label: 'Blog', icon: 'i-lucide-book', to: '/blog' },
  ]
}
