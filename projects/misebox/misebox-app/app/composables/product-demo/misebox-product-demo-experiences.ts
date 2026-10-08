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
  {
    to: '/demo/kiosk',
    eyebrow: 'Self service',
    title: 'Order at a kiosk',
    description:
      'Switch between restaurant, burger-counter and pizzeria presentations in the same touch-first Kiosk.',
    icon: 'i-lucide-monitor-smartphone',
    accent: 'warning',
    highlights: ['Three Kitchen themes', 'Local basket', 'No live submission'],
  },
  {
    to: '/demo/service',
    eyebrow: 'Kitchen team',
    title: 'Preview the order board',
    description:
      'Move fictional Deanos tickets through Incoming, Queue and Pass. Customer confirmation and payment are outside this preview.',
    icon: 'i-lucide-chef-hat',
    accent: 'success',
    highlights: ['Sample tickets', 'Queue → Pass', 'Reset preview'],
  },
]
