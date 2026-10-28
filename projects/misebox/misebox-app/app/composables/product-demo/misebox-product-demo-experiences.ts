import type { MiseboxProductDemoExperienceModel } from './misebox-product-demo.model'

export const experiences: readonly MiseboxProductDemoExperienceModel[] = [
  {
    to: '/demo/menu',
    eyebrow: 'Guest view',
    title: 'Browse a menu',
    description:
      'Browse Misebox Restaurant’s polished seasonal Menu with photographed and image-free dishes.',
    icon: 'i-lucide-book-open',
    accent: 'primary',
    highlights: [
      'Responsive sections',
      'Mixed image coverage',
      'Real Menu components',
    ],
  },
]
