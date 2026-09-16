"""Move Menu ordering policies to explicit Kitchen services; never enable a new service."""
from copy import deepcopy
from pathlib import Path
import kitchen_ordering_runner
from kitchen_ordering_runner import TARGET, run
LA_TAP = 'ChIJ08WSgYSjj0cRD6oE3RwUFk0'
TYPES = {'dine_in', 'eat_in', 'takeaway', 'collection', 'delivery', 'pre_order', 'room_service'}

def decode(value):
    if 'mapValue' in value:
        return {k: decode(v) for k, v in value['mapValue'].get('fields', {}).items()}
    if 'arrayValue' in value:
        return [decode(v) for v in value['arrayValue'].get('values', [])]
    if 'integerValue' in value:
        return int(value['integerValue'])
    if 'doubleValue' in value:
        return float(value['doubleValue'])
    for key in ['stringValue', 'booleanValue', 'nullValue']:
        if key in value:
            return value[key]
    raise ValueError('Unsupported policy value')

def encode(value):
    if isinstance(value, dict):
        return {'mapValue': {'fields': {k: encode(v) for k, v in value.items()}}}
    if isinstance(value, list):
        return {'arrayValue': {'values': [encode(v) for v in value]}}
    if isinstance(value, bool):
        return {'booleanValue': value}
    if isinstance(value, int):
        return {'integerValue': str(value)}
    if isinstance(value, float):
        return {'doubleValue': value}
    if isinstance(value, str):
        return {'stringValue': value}
    if value is None:
        return {'nullValue': None}
    raise ValueError('Unsupported policy value')

def service_policy(policy, ordering):
    result = deepcopy(policy)
    if result.get('type') not in TYPES:
        raise ValueError('Unknown service type')
    hours = result.get('service_hours')
    if not hours or hours.get('inherit_menu_service_hours'):
        hours = deepcopy(ordering.get('service_hours') or {'inherit_kitchen_operation_hours': True})
    hours.pop('inherit_menu_service_hours', None)
    if hours.get('inherit_kitchen_operation_hours'):
        hours = {'inherit_kitchen_operation_hours': True}
    elif hours.get('operation_hours'):
        hours['inherit_kitchen_operation_hours'] = False
    result['service_hours'] = hours
    fulfilment = result.get('fulfilment', {})
    fulfilment.pop('delivery_zones', None)
    fulfilment.pop('payment_methods', None)
    if fulfilment:
        if 'deposit' in fulfilment:
            deposit = fulfilment['deposit']
            deposit['amount'] = float(deposit['amount'])
        result['fulfilment'] = fulfilment
    else:
        result.pop('fulfilment', None)
    for key in ['notice_hours', 'slot_interval_minutes', 'schedule_horizon_days']:
        if key in result:
            result[key] = float(result[key])
    return result

def build_plan(inventory):
    changes, issues = ([], [])

    def change(record, after):
        before = record.get('fields', {})
        changed = sorted((k for k in before.keys() | after.keys() if before.get(k) != after.get(k)))
        if changed:
            changes.append({'name': record['name'], 'updateTime': record['updateTime'], 'before': before, 'after': after, 'changed': changed})
    for kitchen in inventory['kitchens']:
        kid = kitchen['name'].split('/')[-1]
        menus = [m for m in inventory['menus'] if m['name'].startswith(kitchen['name'] + '/menus/')]
        legacy = [m for m in menus if 'ordering' in m.get('fields', {})]
        before = kitchen.get('fields', {})
        after = deepcopy(before)
        if legacy and 'ordering' in before:
            issues.append({'path': kitchen['name'], 'reason': 'Both Kitchen and Menu policies exist; manual review required'})
            continue
        services = {}
        for menu in legacy:
            mid = menu['name'].split('/')[-1]
            data = menu['fields']
            ordering = decode(data['ordering'])
            if decode(data.get('status', {'stringValue': 'draft'})) == 'archived':
                continue
            for policy in ordering.get('order_types', []):
                try:
                    normalized = service_policy(policy, ordering)
                except (ValueError, TypeError, KeyError) as error:
                    issues.append({'path': menu['name'], 'reason': str(error)})
                    continue
                kind = normalized['type']
                enabled = ordering.get('enabled') is True
                current = services.get(kind)
                if current and {k: v for k, v in current.items() if k not in ['menu_ids', 'enabled']} != normalized:
                    issues.append({'path': menu['name'], 'reason': 'Conflicting ' + kind + ' policies'})
                    continue
                if current and current['enabled'] != enabled:
                    issues.append({'path': menu['name'], 'reason': 'Mixed enabled states for ' + kind})
                    continue
                if not current:
                    services[kind] = {**normalized, 'enabled': enabled, 'menu_ids': []}
                services[kind]['menu_ids'].append(mid)
        # Preserve La Tap's current disabled food service; archived policy stays in the backup.
        if kid == LA_TAP and legacy and ('pre_order' not in services):
            food = next((m for m in legacy if m['name'].endswith('/food')), None)
            if food:
                previous = decode(food['fields']['ordering'])
                if previous.get('enabled') is True or previous.get('order_types'):
                    issues.append({'path': food['name'], 'reason': 'La Tap policy changed since review'})
                else:
                    services['pre_order'] = {**service_policy({'type': 'pre_order'}, previous), 'enabled': False, 'menu_ids': ['food']}
        if legacy:
            after['ordering'] = encode({'services': sorted(services.values(), key=lambda s: s['type'])})
        if 'orders' in after:
            order_fields = after['orders'].get('mapValue', {}).get('fields', {})
            for key in ['modes', 'default_lead_time_minutes', 'acceptance_required']:
                order_fields.pop(key, None)
        change(kitchen, after)
        for menu in legacy:
            clean = deepcopy(menu['fields'])
            clean.pop('ordering', None)
            change(menu, clean)
    return {'target': TARGET, 'changes': changes, 'issues': issues}
if __name__ == '__main__':
    run(build_plan, [__file__, kitchen_ordering_runner.__file__])
