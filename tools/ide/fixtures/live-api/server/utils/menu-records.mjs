// Canonical seed recipe supplied by the Kitchen owner for this isolated fixture.
export const fixtureMenuDate = '2099-11-23'
export const fixtureMenuPath = 'kitchens/place-000/menus/special-menu'
export const fixtureItemPath = 'kitchens/place-000/dishes/roll'

export function fixtureItemChoices(price = 2) {
  return [
    {
      id: 'extras',
      name: 'Extras',
      min: 0,
      max: 1,
      pricing: 'additional',
      options: [{ id: 'aioli', label: 'Extra aioli', price }],
    },
  ]
}

export function fixtureMenuRecords(stamp) {
  const stamps = { created: stamp, updated: stamp }
  return [
    [
      fixtureMenuPath,
      {
        slug: 'specials',
        name: 'Specials',
        status: 'published',
        format: 'interactive',
        schedule: 'daily',
        purpose: 'specials',
        published_dates: [fixtureMenuDate],
        audience: 'public',
        sort_order: 0,
        context: 'PRIVATE_MENU_MARKER',
        ...stamps,
      },
    ],
    [
      `${fixtureMenuPath}/sections/selection`,
      {
        label: 'Specials',
        date: fixtureMenuDate,
        status: 'active',
        sort_order: 0,
        ...stamps,
      },
    ],
    [
      `${fixtureMenuPath}/sections/selection/items/roll-placement`,
      {
        dish_id: 'roll',
        status: 'active',
        sort_order: 0,
        ...stamps,
      },
    ],
    [
      fixtureItemPath,
      {
        name: 'Octopus Roll',
        description: 'Served with fries',
        status: 'active',
        item_kind: 'food',
        price: 25,
        image: '',
        choice_groups: fixtureItemChoices(),
        context: 'PRIVATE_ITEM_MARKER',
        ...stamps,
      },
    ],
    ['kitchens/place-000/integrations/sproochli', { enabled: false }],
  ]
}
