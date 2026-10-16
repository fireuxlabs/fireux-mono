"""Plan a price-preserving move from ordinary Menu placements to catalogue Dishes.

Offline only. No credentials, network, apply mode, or Order access.
"""
import argparse
import hashlib
import json
from pathlib import Path
from datetime import date

TERMS = ('price', 'price_options', 'add_ons')


def pricing(data):
    return {
        'price': data.get('price', 0),
        'price_options': data.get('price_options', []),
        'add_ons': data.get('add_ons', []),
    }


def build_plan(inventory, as_of_date=None):
    kitchen = inventory['kitchen']
    kitchen_id = kitchen['id']
    root = 'kitchens/' + kitchen_id
    if kitchen['path'] != root:
        raise ValueError('Kitchen identity does not match its path')
    menus = {row['id']: row for row in inventory['menus']}
    sections = {row['path']: row for row in inventory['sections']}
    dishes = {row['id']: row for row in inventory['catalogueDishes']}
    grouped = {}
    skipped = []
    for item in inventory['menuItems']:
        data = item['data']
        menu = menus.get(data.get('menu_id'))
        section = sections.get(item['path'].rsplit('/items/', 1)[0])
        if not menu or not section or not item['path'].startswith(root + '/menus/'):
            raise ValueError('Placement scope is invalid')
        if (menu['data'].get('status') == 'archived' or
                (as_of_date and section['data'].get('date', as_of_date) < as_of_date) or
                section['data'].get('status') == 'archived' or
                data.get('status') == 'archived'):
            skipped.append(item['path'])
            continue
        if data.get('sellable_id'):
            raise ValueError('Shared Sellable reference needs explicit reconciliation')
        dish_id = data.get('dish_id')
        if dish_id not in dishes or dishes[dish_id]['data'].get('kitchen_id') != kitchen_id:
            raise ValueError('Placement Dish ownership is invalid')
        grouped.setdefault(dish_id, []).append(item)
    changes = []
    for dish_id, placements in sorted(grouped.items()):
        terms = pricing(placements[0]['data'])
        if any(pricing(item['data']) != terms for item in placements[1:]):
            raise ValueError('Conflicting current pricing for ' + dish_id)
        dish = dishes[dish_id]
        if any(key in dish['data'] and dish['data'][key] != terms[key] for key in TERMS):
            raise ValueError('Existing Dish pricing conflicts for ' + dish_id)
        changes.append({
            'path': dish['path'], 'updateTime': dish['updateTime'],
            'before': dish['data'], 'after': {**dish['data'], **terms},
        })
        for item in placements:
            changes.append({
                'path': item['path'], 'updateTime': item['updateTime'],
                'before': item['data'],
                'after': {key: value for key, value in item['data'].items()
                          if key not in TERMS},
            })
    return {
        'kitchenId': kitchen_id,
        'dishCount': len(grouped),
        'placementCount': sum(map(len, grouped.values())),
        'changes': changes,
        'retainedHistoricalPlacements': skipped,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--as-of-date', required=True, type=date.fromisoformat)
    args = parser.parse_args()
    result = build_plan(json.loads(Path(args.inventory).read_text()), args.as_of_date.isoformat())
    encoded = json.dumps([result], ensure_ascii=False, sort_keys=True, indent=2)
    Path(args.output).write_text(encoded)
    print(json.dumps({
        'dishes': result['dishCount'], 'placements': result['placementCount'],
        'writes': len(result['changes']),
        'historicalPlacementsRetained': len(result['retainedHistoricalPlacements']),
        'sha256': hashlib.sha256(encoded.encode()).hexdigest(),
    }))


if __name__ == '__main__':
    main()
