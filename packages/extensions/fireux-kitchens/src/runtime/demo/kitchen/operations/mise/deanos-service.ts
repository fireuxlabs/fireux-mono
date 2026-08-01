import type { KitchenMiseTask } from '../../../../models/kitchen/mise.model'
import {
  deanosKitchenDemoIdentity,
  deanosPartyMenuDemoIdentity,
  deanosXmasMenuDemoIdentity,
} from '../../core/fixtures'
import { miseTask } from './builders'

export const deanosKitchenDemoServiceMiseTasks: KitchenMiseTask[] = [
  miseTask(
      deanosKitchenDemoIdentity,
      'wash-main-service-produce',
      'Wash and clean service produce',
      'prep',
      'in_progress',
      'high',
      30,
      {
        workflowStage: 'wash',
        ingredientIds: [
          'lettuce',
          'tomato',
          'spring-onion',
          'mint',
          'lemon',
          'brown-mushrooms',
        ],
        prepItemIds: [
          'washed-shredded-lettuce',
          'sliced-tomato',
          'sliced-spring-onion',
          'washed-mint',
          'lemon-garnish',
          'sliced-brown-mushrooms',
        ],
        checklist: [
          { label: 'Wash and spin lettuce', done: true },
          { label: 'Wash tomatoes and spring onions', done: true },
          'Wash mint and lemons',
          'Clean mushrooms without soaking',
        ],
      }
    ),
  miseTask(
      deanosPartyMenuDemoIdentity,
      'wash-party-produce',
      'Wash party produce',
      'prep',
      'todo',
      'normal',
      15,
      {
        workflowStage: 'wash',
        ingredientIds: ['basil', 'cucumber'],
        prepItemIds: ['washed-basil', 'sliced-cucumber'],
        checklist: ['Wash and dry basil', 'Wash cucumbers'],
      }
    ),
  miseTask(
      deanosXmasMenuDemoIdentity,
      'wash-xmas-rocket',
      'Wash Xmas rocket',
      'prep',
      'todo',
      'normal',
      10,
      {
        workflowStage: 'wash',
        ingredientIds: ['rocket'],
        prepItemIds: ['washed-rocket'],
        checklist: ['Wash rocket', 'Spin dry and hold chilled'],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'set-grill-station',
      'Set the grill station',
      'grill',
      'todo',
      'high',
      15,
      {
        workflowStage: 'set_stations',
        checklist: [
          'Load patties, cheese and buns',
          'Set onions, mushrooms and bacon',
          'Check scraper, seasoning and cloths',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'set-fryer-station',
      'Set the fryer station',
      'fryers',
      'todo',
      'high',
      15,
      {
        workflowStage: 'set_stations',
        checklist: [
          'Load chicken, cauliflower and sides',
          'Set batter and draining trays',
          'Check oil temperature',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'set-drinks-station',
      'Set the drinks station',
      'drinks',
      'todo',
      'normal',
      12,
      {
        workflowStage: 'set_stations',
        checklist: [
          'Load syrups and cordial',
          'Set cups, lids and straws',
          'Check soft serve and sparkling water',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'set-pass',
      'Set the pass and packaging',
      'pass',
      'todo',
      'normal',
      12,
      {
        workflowStage: 'set_stations',
        checklist: [
          'Stock trays, bags and napkins',
          'Set sauces and garnishes',
          'Check printer and order screen',
        ],
      }
    ),
  miseTask(
      deanosPartyMenuDemoIdentity,
      'set-party-packing',
      'Set the party packing area',
      'pass',
      'todo',
      'normal',
      15,
      {
        workflowStage: 'set_stations',
        checklist: [
          'Count platters and drink vessels',
          'Label collection order',
          'Set holding and handoff space',
        ],
      }
    ),
  miseTask(
      deanosXmasMenuDemoIdentity,
      'set-xmas-pass',
      'Set the Xmas pass',
      'pass',
      'todo',
      'normal',
      15,
      {
        workflowStage: 'set_stations',
        checklist: [
          'Set cranberry and gravy garnishes',
          'Check festive packaging',
          'Brief pass on Xmas builds',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'final-allergen-check',
      'Complete allergen and label check',
      'pass',
      'todo',
      'urgent',
      12,
      {
        workflowStage: 'final_checks',
        checklist: [
          'Check every batch label and date',
          'Confirm allergen utensils and containers',
          'Brief the service team',
        ],
      }
    ),
  miseTask(
      deanosKitchenDemoIdentity,
      'final-par-temperature-check',
      'Check par, temperatures and readiness',
      'pass',
      'todo',
      'high',
      10,
      {
        workflowStage: 'final_checks',
        checklist: [
          'Check chilled and hot-hold temperatures',
          'Confirm opening pars',
          'Sign off every station',
        ],
      }
    )
]
