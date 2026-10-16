import {
  kitchenDemoMediaUrl,
  miseboxRestaurantKitchenDemoIdentity,
} from '../../core/fixtures'
import { dishes } from './builders'

const miseboxRestaurantAsset = (filename: string) =>
  kitchenDemoMediaUrl(
    miseboxRestaurantKitchenDemoIdentity.kitchenId,
    `menu/${filename}`
  )

export const miseboxRestaurantDemoDishes = dishes(
  miseboxRestaurantKitchenDemoIdentity,
  [
    {
      id: 'fire-roasted-margherita',
      name: 'Fire-roasted margherita',
      description:
        'San Marzano tomato, fior di latte, basil and extra-virgin olive oil.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('fire-roasted-margherita.jpg'),
      price: 18,
      price_options: [
        { label: 'Regular', quantity: 1, unit: 'pizza', price: 18 },
        { label: 'Large', quantity: 1, unit: 'pizza', price: 24 },
      ],
      add_ons: [
        { id: 'chilli-oil', label: 'House chilli oil', price: 1.5 },
        { id: 'buffalo-mozzarella', label: 'Buffalo mozzarella', price: 4 },
      ],
    },
    {
      id: 'charred-mushroom-flatbread',
      name: 'Charred mushroom flatbread',
      description:
        'Wood-fired flatbread with thyme-roasted mushrooms, taleggio and pickled shallots.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('charred-mushroom-flatbread.jpg'),
      price: 23,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'ember-roasted-chicken',
      name: 'Ember-roasted chicken',
      description:
        'Herb-brined chicken roasted over embers with lemon, charred shallots and roasting juices.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('ember-roasted-chicken.jpg'),
      price: 29,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'garden-lunch-deal',
      name: 'Garden lunch deal',
      description:
        'A fixed lunch bundle with charred mushroom flatbread, rosemary roast potatoes and an elderflower spritz.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('garden-lunch-deal.jpg'),
      price: 31,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'hearth-chicken-deal',
      name: 'Hearth chicken deal',
      description:
        'A fixed bundle with ember-roasted chicken, garden slaw and a blood orange soda.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('hearth-chicken-deal.jpg'),
      price: 39,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'market-bowl-deal',
      name: 'Market bowl deal',
      description:
        'A fixed bundle with green tahini falafel bowl, charred tenderstem broccoli and a cucumber & mint cooler.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('market-bowl-deal.jpg'),
      price: 34,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'garden-curry',
      name: 'Garden curry',
      description:
        'Roasted seasonal vegetables, coconut curry, fragrant rice and fresh herbs.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('garden-curry.jpg'),
      price: 22,
      price_options: [],
      add_ons: [{ id: 'crispy-tofu', label: 'Crispy tofu', price: 4 }],
    },
    {
      id: 'roasted-squash-grains',
      name: 'Roasted squash & grains',
      description:
        'Ancient grains, maple-roasted squash, feta, pumpkin seeds and green tahini.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('roasted-squash-grains.jpg'),
      price: 21,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'green-tahini-falafel-bowl',
      name: 'Green tahini falafel bowl',
      description:
        'Crisp herb falafel, lemon grains, cucumber, pickled cabbage and vivid green tahini.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('green-tahini-falafel-bowl.jpg'),
      price: 23,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'market-garden-salad',
      name: 'Market garden salad',
      description:
        'Leaves, charred vegetables, soft herbs, toasted seeds and lemon dressing.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('market-garden-salad.jpg'),
      price: 17,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'herb-roasted-trout',
      name: 'Herb-roasted trout',
      description:
        'Roasted trout fillet with crushed potatoes, shaved fennel, greens and lemon butter.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('herb-roasted-trout.jpg'),
      price: 28,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'ember-aubergine',
      name: 'Ember aubergine',
      description:
        'Fire-softened aubergine with whipped feta, lentils, pomegranate, mint and almonds.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('ember-aubergine.jpg'),
      price: 24,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'rosemary-roast-potatoes',
      name: 'Rosemary roast potatoes',
      description:
        'Crisp oven-roasted potatoes with rosemary, flaky sea salt and lemon zest.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('rosemary-roast-potatoes.jpg'),
      price: 8,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'charred-tenderstem-broccoli',
      name: 'Charred tenderstem broccoli',
      description:
        'Tenderstem broccoli with lemon, chilli and toasted almond flakes.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('charred-tenderstem-broccoli.jpg'),
      price: 9,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'warm-garlic-flatbread',
      name: 'Warm garlic flatbread',
      description:
        'Wood-fired flatbread brushed with confit garlic butter and parsley.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('warm-garlic-flatbread.jpg'),
      price: 7,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'burnt-basque-cheesecake',
      name: 'Burnt Basque cheesecake',
      description:
        'Deeply caramelised cheesecake with a soft centre and seasonal berry compote.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('burnt-basque-cheesecake.jpg'),
      price: 11,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'wood-fired-stone-fruit',
      name: 'Wood-fired stone fruit',
      description:
        'Warm stone fruit with vanilla mascarpone, pistachios, basil and honey.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('wood-fired-stone-fruit.jpg'),
      price: 12,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'dark-chocolate-sea-salt-pot',
      name: 'Dark chocolate & sea salt pot',
      description:
        'Silky dark chocolate custard with soft cream, sea salt and cocoa nibs.',
      item_kind: 'food',
      image: miseboxRestaurantAsset('dark-chocolate-sea-salt-pot.jpg'),
      price: 10,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'elderflower-spritz',
      name: 'Elderflower spritz',
      description: 'Elderflower, lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: miseboxRestaurantAsset('elderflower-spritz.jpg'),
      price: 7,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'blood-orange-soda',
      name: 'Blood orange soda',
      description: 'Blood orange, pink grapefruit and sparkling mineral water.',
      item_kind: 'drink',
      image: miseboxRestaurantAsset('blood-orange-soda.jpg'),
      price: 7,
      price_options: [],
      add_ons: [],
    },
    {
      id: 'cucumber-mint-cooler',
      name: 'Cucumber & mint cooler',
      description: 'Pressed cucumber, lime, fresh mint and chilled soda water.',
      item_kind: 'drink',
      image: miseboxRestaurantAsset('cucumber-mint-cooler.jpg'),
      price: 7,
      price_options: [],
      add_ons: [],
    },
  ]
)
