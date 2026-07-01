// Repo-level demo payloads for Chefs.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

import type { Chef } from '../packages/extensions/fireux-kitchens/src/runtime/models/chef.model'
import { ChefModel } from '../packages/extensions/fireux-kitchens/src/runtime/models/chef.model'
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
    userId: 'demo-user-chef-ava',
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
    userId: 'demo-user-chef-luca',
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
    userId: 'demo-user-chef-noor',
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

const buildChefCore = (base: ChefBase): Chef => ({
  ...ChefModel,
  id: base.id,
  title: base.chefHeadline,
  summary: base.summary,
  chef_image: base.chefImage,
  chef_signature_dishes: base.signatureDishes,
  kitchen_ids: [base.kitchenId],
  chef_organization_name: base.organizationName,
  locations: base.locations,
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
