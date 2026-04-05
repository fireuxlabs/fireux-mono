// Local demo payloads for Chefs (git-ignored).
// These files are for dev-only UI prototyping and are not part of the repo.

import type { ChefCore } from '../packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model'
import { demoUserList } from './user.demo'

type ChefBase = {
  id: string
  userId: string
  kitchenId: string
  chefHeadline: string
  summary: string
  chefImage: string
  signatureDishes: string[]
  organizationName: string
  locations: string[]
}

const demoUsersById = new Map(demoUserList.map((user) => [user.id, user]))

const demoChefBaseList: ChefBase[] = [
  {
    id: 'chef_demo_001',
    userId: 'user_demo_001',
    kitchenId: 'stack-sizzle',
    chefHeadline: 'Service-led grill lead',
    summary: 'Fast casual kitchen lead focused on prep rhythm and reliable service handoff.',
    chefImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=480&q=80',
    signatureDishes: ['Classic Burger', 'House Slaw', 'Loaded Fries'],
    organizationName: 'Stack & Sizzle',
    locations: ['Zurich', 'Basel'],
  },
  {
    id: 'chef_demo_002',
    userId: 'user_demo_002',
    kitchenId: 'takumi-ramen',
    chefHeadline: 'Broth and noodle specialist',
    summary: 'Focused on ramen prep systems, tare balance, and consistent bowl execution.',
    chefImage:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=480&q=80',
    signatureDishes: ['Shoyu Ramen', 'Miso Ramen', 'Tonkotsu Shoyu'],
    organizationName: 'Takumi Ramen-ya',
    locations: ['Bern'],
  },
  {
    id: 'chef_demo_003',
    userId: 'user_demo_003',
    kitchenId: 'broth-bloom',
    chefHeadline: 'Late-service operations lead',
    summary: 'Known for calm pass management, clean station setup, and dependable late service.',
    chefImage:
      'https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=480&q=80',
    signatureDishes: ['Spicy Garlic Ramen', 'Veggie Shoyu Ramen'],
    organizationName: 'Broth & Bloom',
    locations: ['Lucerne'],
  },
]

const buildChefCore = (base: ChefBase): ChefCore => ({
  id: base.id,
  chef_headline: base.chefHeadline,
  summary: base.summary,
  chef_bio: '',
  chef_image: base.chefImage,
  chef_signature_dishes: base.signatureDishes,
  kitchen_ids: [base.kitchenId],
  chef_organization_name: base.organizationName,
  title: '',
  subtitle: '',
  tagline: '',
  tags: [],
  bio_long: '',
  specialties: [],
  locations: base.locations,
  organization_name: '',
  creator_id: undefined,
  created_at: {} as ChefCore['created_at'],
  updated_at: {} as ChefCore['updated_at'],
})

export const demoChefSurfaceList = demoChefBaseList.map((base) => {
  const user = demoUsersById.get(base.userId)
  return {
    chef: buildChefCore(base),
    user,
  }
})

export const demoChefCoreList = demoChefSurfaceList.map((surface) => surface.chef)
export const demoChefCore = demoChefCoreList[0]
