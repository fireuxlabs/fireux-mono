// Misebox-owned literature for parent directories that explain the Ecosystem
// without copying the Misebox landing or inventing capabilities.
export const miseboxEcosystemProfile = {
  eyebrow: 'FireUX ecosystem',
  title: 'Misebox',
  description:
    'Misebox is the FireUX ecosystem for restaurant menus and kitchen work. It connects published menus with dishes, recipes, preparation, orders, hiring, and public profiles.',
  seo: {
    title: 'Misebox · FireUX Ecosystem',
    description:
      'See how FireUX provides the shared App foundation while Misebox owns hospitality products for menus, kitchens, preparation, hiring, and service.',
  },
  websiteUrl: 'https://misebox.app',
  relationship: [
    {
      title: 'What FireUX provides',
      description:
        'FireUX provides the shared Project, App, identity, and user foundations. It records Misebox as an Ecosystem and indexes the Apps published within it.',
      icon: 'i-lucide-orbit',
    },
    {
      title: 'What Misebox owns',
      description:
        'Misebox owns the hospitality language and workflows: Kitchens, menus, dishes, recipes, preparation, orders, Jobs, chefs, and restaurant profiles.',
      icon: 'i-lucide-chef-hat',
    },
  ],
  pathways: [
    {
      title: 'Kitchen operations',
      description:
        'See the source-defined work areas that make up the Misebox Kitchen Console.',
      to: 'https://misebox.app/operations',
      icon: 'i-lucide-layout-dashboard',
    },
    {
      title: 'Hospitality solutions',
      description:
        'Start from a specific job, including publishing menus, organising preparation, managing recipes, or hiring.',
      to: 'https://misebox.app/solutions',
      icon: 'i-lucide-lightbulb',
    },
    {
      title: 'Published Kitchens',
      description:
        'Browse public Kitchen pages and menus that their owners have chosen to publish.',
      to: 'https://misebox.app/kitchens',
      icon: 'i-lucide-store',
    },
    {
      title: 'Misebox Jobs',
      description:
        'Browse published hospitality roles and the Kitchens and Companies hiring for them.',
      to: 'https://misebox.app/jobs',
      icon: 'i-lucide-briefcase-business',
    },
  ],
  featuredSolutionSlugs: [
    'digital-restaurant-menu',
    'restaurant-menu-management',
    'recipe-management-software',
    'kitchen-prep-planner',
    'restaurant-hiring-software',
    'restaurant-profile-page',
  ],
} as const
