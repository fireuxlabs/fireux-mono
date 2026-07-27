import {
  kitchenDemoAssetBase,
  miseboxRestaurantKitchenDemoIdentity,
} from '../../core/fixtures'
import { dishes } from './builders'

const miseboxRestaurantAssetBase = `${kitchenDemoAssetBase}/misebox-restaurant`

export const miseboxRestaurantDemoDishes = dishes(
  miseboxRestaurantKitchenDemoIdentity,
  [
    {
      id: 'fire-roasted-margherita',
      name: 'Fire-roasted margherita',
      description:
        'San Marzano tomato, fior di latte, basil and extra-virgin olive oil.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/fire-roasted-margherita.jpg`,
    },
    {
      id: 'charred-mushroom-flatbread',
      name: 'Charred mushroom flatbread',
      description:
        'Wood-fired flatbread with thyme-roasted mushrooms, taleggio and pickled shallots.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/charred-mushroom-flatbread.jpg`,
    },
    {
      id: 'ember-roasted-chicken',
      name: 'Ember-roasted chicken',
      description:
        'Herb-brined chicken roasted over embers with lemon, charred shallots and roasting juices.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/ember-roasted-chicken.jpg`,
    },
    {
      id: 'garden-lunch-deal',
      name: 'Garden lunch deal',
      description:
        'A fixed lunch bundle with charred mushroom flatbread, rosemary roast potatoes and an elderflower spritz.',
      item_kind: 'food',
      is_deal: true,
      image: `${miseboxRestaurantAssetBase}/garden-lunch-deal.jpg`,
    },
    {
      id: 'hearth-chicken-deal',
      name: 'Hearth chicken deal',
      description:
        'A fixed bundle with ember-roasted chicken, garden slaw and a blood orange soda.',
      item_kind: 'food',
      is_deal: true,
      image: `${miseboxRestaurantAssetBase}/hearth-chicken-deal.jpg`,
    },
    {
      id: 'market-bowl-deal',
      name: 'Market bowl deal',
      description:
        'A fixed bundle with green tahini falafel bowl, charred tenderstem broccoli and a cucumber & mint cooler.',
      item_kind: 'food',
      is_deal: true,
      image: `${miseboxRestaurantAssetBase}/market-bowl-deal.jpg`,
    },
    {
      id: 'garden-curry',
      name: 'Garden curry',
      description:
        'Roasted seasonal vegetables, coconut curry, fragrant rice and fresh herbs.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/garden-curry.jpg`,
    },
    {
      id: 'roasted-squash-grains',
      name: 'Roasted squash & grains',
      description:
        'Ancient grains, maple-roasted squash, feta, pumpkin seeds and green tahini.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/roasted-squash-grains.jpg`,
    },
    {
      id: 'green-tahini-falafel-bowl',
      name: 'Green tahini falafel bowl',
      description:
        'Crisp herb falafel, lemon grains, cucumber, pickled cabbage and vivid green tahini.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/green-tahini-falafel-bowl.jpg`,
    },
    {
      id: 'market-garden-salad',
      name: 'Market garden salad',
      description:
        'Leaves, charred vegetables, soft herbs, toasted seeds and lemon dressing.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/market-garden-salad.jpg`,
    },
    {
      id: 'herb-roasted-trout',
      name: 'Herb-roasted trout',
      description:
        'Roasted trout fillet with crushed potatoes, shaved fennel, greens and lemon butter.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/herb-roasted-trout.jpg`,
    },
    {
      id: 'ember-aubergine',
      name: 'Ember aubergine',
      description:
        'Fire-softened aubergine with whipped feta, lentils, pomegranate, mint and almonds.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/ember-aubergine.jpg`,
    },
    {
      id: 'rosemary-roast-potatoes',
      name: 'Rosemary roast potatoes',
      description:
        'Crisp oven-roasted potatoes with rosemary, flaky sea salt and lemon zest.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/rosemary-roast-potatoes.jpg`,
    },
    {
      id: 'charred-tenderstem-broccoli',
      name: 'Charred tenderstem broccoli',
      description:
        'Tenderstem broccoli with lemon, chilli and toasted almond flakes.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/charred-tenderstem-broccoli.jpg`,
    },
    {
      id: 'warm-garlic-flatbread',
      name: 'Warm garlic flatbread',
      description:
        'Wood-fired flatbread brushed with confit garlic butter and parsley.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/warm-garlic-flatbread.jpg`,
    },
    {
      id: 'burnt-basque-cheesecake',
      name: 'Burnt Basque cheesecake',
      description:
        'Deeply caramelised cheesecake with a soft centre and seasonal berry compote.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/burnt-basque-cheesecake.jpg`,
    },
    {
      id: 'wood-fired-stone-fruit',
      name: 'Wood-fired stone fruit',
      description:
        'Warm stone fruit with vanilla mascarpone, pistachios, basil and honey.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/wood-fired-stone-fruit.jpg`,
    },
    {
      id: 'dark-chocolate-sea-salt-pot',
      name: 'Dark chocolate & sea salt pot',
      description:
        'Silky dark chocolate custard with soft cream, sea salt and cocoa nibs.',
      item_kind: 'food',
      image: `${miseboxRestaurantAssetBase}/dark-chocolate-sea-salt-pot.jpg`,
    },
    {
      id: 'elderflower-spritz',
      name: 'Elderflower spritz',
      description: 'Elderflower, lemon, mint and sparkling water.',
      item_kind: 'drink',
      image: `${miseboxRestaurantAssetBase}/elderflower-spritz.jpg`,
    },
    {
      id: 'blood-orange-soda',
      name: 'Blood orange soda',
      description: 'Blood orange, pink grapefruit and sparkling mineral water.',
      item_kind: 'drink',
      image: `${miseboxRestaurantAssetBase}/blood-orange-soda.jpg`,
    },
    {
      id: 'cucumber-mint-cooler',
      name: 'Cucumber & mint cooler',
      description: 'Pressed cucumber, lime, fresh mint and chilled soda water.',
      item_kind: 'drink',
      image: `${miseboxRestaurantAssetBase}/cucumber-mint-cooler.jpg`,
    },
  ]
)
