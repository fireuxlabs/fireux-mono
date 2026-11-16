import { defineFireuxMeta } from 'fireux-core/runtime/app/literature/define-meta'
import { swissJobsLegalReview } from 'fireux-jobs/runtime/content/swiss-legal-review'
import { miseboxSolutions } from 'fireux-misebox/runtime/content/solutions'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'misebox',
    name: 'Misebox',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'Manage your menu and kitchen<br>in one place.',
    headline: 'Menu and kitchen management',
    highlight_terms: [
      'kitchens',
      'menus',
      'recipes',
      'prep',
      'orders',
      'team',
      'service',
      'handoff',
      'connected workflow',
    ],
    positioning_html:
      'Publish <strong>menus</strong>, organise prep and manage orders with Misebox.',
    workspace_bridge_html:
      'Follow one <strong>connected workflow</strong> from guest menu to Kitchen handoff.',
    about_p1:
      'Misebox connects published menus with the dishes, orders, and service handoff behind them.',
  },
  seo: {
    title: 'Restaurant Kitchen Management Workspace | Misebox',
    description:
      'Create your Kitchen workspace, publish Menus, and connect dishes, recipes, preparation and orders.',
    keywords: [
      'kitchen operations software',
      'restaurant kitchen management',
      'restaurant menu management',
      'kitchen preparation workflow',
      'restaurant service workflow',
      'menu recipe operations',
    ],
    audience: [
      'restaurant owners',
      'kitchen operators',
      'head chefs',
      'restaurant service teams',
    ],
    categories: [
      'kitchen operations software',
      'restaurant menu management',
      'restaurant service operations',
    ],
    primary_topic: 'kitchen operations software',
  },
  legal: { notices: [swissJobsLegalReview] },
  solutions: miseboxSolutions,
})
