import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'werkbox',
  // The logical Project is Werkbox; Firebase and database bindings retain their physical ids.
  projectId: 'werkbox',
  ecosystemId: 'cleanbox',
  id: 'cleanbox-app',
  context: "Werkbox connects practical jobs, skilled professionals and organisations that keep places running. Its audience includes people seeking work, services and professional connections.",
  name: 'Werkbox',
  shortName: 'Werkbox',
  role: 'global',
  domains: ['jobs'],
  profiles: ['agent', 'professional'],
  selfJoinEnabled: true,
  seo: {
    staticPaths: ['/categories/cleaning'],
  },
  modules: [
    'fireux-places',
    'fireux-companies',
    [
      'fireux-jobs',
      {
        categories: 'all',
      },
    ],
  ],
  extends: [
    'fireux-werkbox/layer',
    'fireux-blogs/layer',
    'fireux-places/layer',
    'fireux-companies/layer',
    'fireux-jobs/layer',
  ],
})
