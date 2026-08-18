import type { KitchenMiseTask } from '../../../models/mise.model.ts'
import {
  deanosKitchenDemoIdentity,
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
} from '../../core/fixtures'
import { miseTask } from './builders'
import { deanosKitchenDemoRecipeTasks } from './recipe-tasks'

export const deanosKitchenDemoPreparationMiseTasks: KitchenMiseTask[] = [
  miseTask(
      deanosKitchenDemoIdentity,
      'shape-main-patties',
      'Portion burger balls',
      'grill',
      'done',
      'high',
      35,
      {
        workflowStage: 'cut_portion',
        ingredientIds: ['beef-mince'],
        prepItemIds: ['smash-patty-80g'],
        checklist: [
          { label: 'Weigh 80 g portions', done: true },
          { label: 'Roll into loose balls', done: true },
          { label: 'Tray, cover and chill', done: true },
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'split-main-buns',
      'Split burger buns',
      'prep',
      'todo',
      'normal',
      15,
      {
        workflowStage: 'cut_portion',
        prepItemIds: ['split-burger-bun'],
        checklist: ['Split buns cleanly', 'Tray for service'],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'slice-main-cheese',
      'Slice and portion cheese',
      'prep',
      'todo',
      'normal',
      20,
      {
        workflowStage: 'cut_portion',
        ingredientIds: ['swiss-cheese', 'cheddar-cheese'],
        prepItemIds: ['sliced-swiss-cheese', 'sliced-cheddar'],
        checklist: ['Slice Swiss cheese', 'Slice cheddar', 'Cover and chill'],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'cut-main-produce',
      'Cut service produce',
      'prep',
      'todo',
      'high',
      30,
      {
        workflowStage: 'cut_portion',
        prepItemIds: [
          'washed-shredded-lettuce',
          'sliced-brown-mushrooms',
          'sliced-tomato',
          'sliced-spring-onion',
        ],
        checklist: [
          'Shred lettuce',
          'Slice mushrooms',
          'Slice tomatoes',
          'Slice spring onions',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'portion-fryer-veg',
      'Cut and portion fryer vegetables',
      'fryers',
      'todo',
      'normal',
      25,
      {
        workflowStage: 'cut_portion',
        prepItemIds: ['cauliflower-florets', 'sliced-onion-rings'],
        checklist: [
          'Cut even cauliflower florets',
          'Slice and separate onion rings',
          'Dry and portion',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'portion-drinks-garnish',
      'Portion drinks garnish',
      'drinks',
      'todo',
      'normal',
      15,
      {
        workflowStage: 'cut_portion',
        prepItemIds: [
          'washed-mint',
          'lemon-garnish',
          'service-ready-vanilla-soft-serve',
        ],
        checklist: [
          'Pick mint sprigs',
          'Slice lemon garnish',
          'Check soft-serve level',
        ],
      }
    ),
  miseTask(
      deanosPartyMenuDemoIdentity,
      'portion-party-burgers',
      'Portion party sliders',
      'prep',
      'todo',
      'high',
      35,
      {
        workflowStage: 'cut_portion',
        prepItemIds: ['slider-patty-60g', 'split-slider-bun'],
        checklist: [
          'Shape 60 g slider patties',
          'Split slider buns',
          'Count against party order',
        ],
      }
    ),
  miseTask(
      deanosXmasMenuDemoIdentity,
      'portion-xmas-cheese',
      'Slice Xmas Brie',
      'prep',
      'todo',
      'normal',
      15,
      {
        workflowStage: 'cut_portion',
        prepItemIds: ['sliced-brie'],
        checklist: ['Slice Brie evenly', 'Cover and chill'],
      }
    ),
  ...deanosKitchenDemoRecipeTasks
]
