import type {
  TemplateOneFlagshipDish,
  TemplateOneMenuContent,
} from 'fireux-misebox/runtime/models/template-one'

const productDemoSurface = 'template-one' as const
const productDemoDataSource = 'demo' as const
const money = (value: number) => `CHF ${value.toFixed(2)}`

export async function useTemplateOneProductDemo(): Promise<{
  menu: TemplateOneMenuContent
  flagshipDish: TemplateOneFlagshipDish
}> {
  const { deanosKitchenDemoMenu } = await import(
    'fireux-kitchens/runtime/kitchen/demo/operations/Menus/deanos-main'
  )
  const dishById = new Map(
    deanosKitchenDemoMenu.dishes.map((dish) => [dish.id, dish])
  )
  const menu: TemplateOneMenuContent = {
    menu: {
      id: deanosKitchenDemoMenu.rootMenu.id,
      name: deanosKitchenDemoMenu.rootMenu.name,
      description: deanosKitchenDemoMenu.rootMenu.description || '',
      sections: deanosKitchenDemoMenu.menuSections.map(
        ({ section, items }) => ({
          id: section.id,
          label: section.label,
          items: items.map((item) => {
            const dish = dishById.get(item.dish_id || '')!
            return {
              id: item.id,
              dishId: dish.id,
              itemKind: dish.item_kind,
              name: dish.name,
              description: dish.description,
              imageUrl: dish.image,
              price: dish.price,
              priceLabel: money(dish.price),
              priceOptions: dish.price_options.map((option, index) => ({
                ...option,
                id:
                  option.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
                  `option-${index + 1}`,
                priceLabel: money(option.price),
              })),
              addOns: dish.add_ons.map((addOn) => ({
                ...addOn,
                priceLabel: money(addOn.price),
              })),
            }
          }),
        })
      ),
    },
    menuHref: '/templates/template-one?kitchen=deanos',
    menuActionLabel: 'Browse menu',
  }
  const dish = deanosKitchenDemoMenu.dishes[0]!
  return {
    menu,
    flagshipDish: {
      id: dish.id,
      name: dish.name,
      description: dish.description,
      image: dish.image,
    },
  }
}
