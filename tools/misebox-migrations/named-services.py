"""Pure, bounded Kitchen.ordering -> Kitchen.services cutover (no runtime fallback)."""
from copy import deepcopy
import re
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import named_services_runner as runner
from kitchen_ordering_runner import TARGET

LABELS = {
    'dine_in': 'Table service', 'eat_in': 'Eat here', 'takeaway': 'Take away',
    'collection': 'Collection', 'delivery': 'Delivery', 'pre_order': 'Pre-order',
    'room_service': 'Room service',
}
DAYS = {'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'}


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
    raise ValueError('Unsupported value in service identity or hours')


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
    raise ValueError('Unsupported service value')


def field(fields, key, default=None):
    return decode(fields[key]) if key in fields else default


def map_fields(value):
    if not isinstance(value, dict) or 'mapValue' not in value:
        raise ValueError('Expected a Firestore map')
    return value['mapValue'].get('fields', {})


def array_values(value):
    if not isinstance(value, dict) or 'arrayValue' not in value:
        raise ValueError('Expected a Firestore array')
    return value['arrayValue'].get('values', [])


def normalize_hours(value, source=None, compact=False):
    """Match weekday/Place readers, but refuse invalid data rather than drop it."""
    if not isinstance(value, dict):
        raise ValueError('Unresolved service hours')
    timezone = str(value.get('timezone') or '').strip()
    try:
        ZoneInfo(timezone)
    except (ValueError, ZoneInfoNotFoundError):
        raise ValueError('Unknown or missing service timezone') from None
    windows = value.get('windows')
    if not isinstance(windows, list) or not windows:
        raise ValueError('Unresolved service hours')
    normalized = []
    for window in windows:
        if not isinstance(window, dict) or not isinstance(window.get('days'), list):
            raise ValueError('Invalid service hours window')
        days = [str(day).strip().lower() for day in window['days']]
        if not days or any(day not in DAYS for day in days):
            raise ValueError('Invalid service hours day')
        times = []
        for key in ['open', 'close']:
            time = str(window.get(key) or '').strip()
            if compact and re.fullmatch(r'\d{4}', time):
                time = time[:2] + ':' + time[2:]
            match = re.fullmatch(r'(\d{1,2}):(\d{2})', time)
            if not match or int(match[1]) > 23 or int(match[2]) > 59:
                raise ValueError('Invalid service hours time')
            times.append(f'{int(match[1]):02}:{int(match[2]):02}')
        normalized.append({'days': list(dict.fromkeys(days)), 'open': times[0], 'close': times[1]})
    return {
        'source': source or ('place' if str(value.get('source', '')).strip().lower() == 'place' else 'custom'),
        'timezone': timezone, 'windows': normalized,
    }


def kitchen_custom_hours(fields):
    orders = map_fields(fields['orders']) if 'orders' in fields else {}
    hours = field(orders, 'operation_hours', {})
    # resolveKitchenOperationHours only prefers nonempty custom Kitchen hours.
    if isinstance(hours, dict) and hours and str(hours.get('source', '')).strip().lower() != 'place' and hours.get('windows'):
        return normalize_hours(hours)
    return None


def needs_place(kitchen):
    fields = kitchen.get('fields', {})
    if 'ordering' not in fields or 'services' in fields:
        return False
    services = array_values(map_fields(fields['ordering']).get('services'))
    inherited = any(custom_service_hours(map_fields(service)) is None for service in services)
    return inherited and kitchen_custom_hours(fields) is None


def custom_service_hours(raw):
    config = field(raw, 'service_hours')
    if config and not isinstance(config, dict):
        raise ValueError('Invalid service hours configuration')
    if config and config.get('inherit_kitchen_operation_hours') is not True:
        hours = config.get('operation_hours')
        if hours and not isinstance(hours, dict):
            raise ValueError('Invalid custom service hours')
        if hours and hours.get('windows'):
            return normalize_hours(hours)
    # Old readKitchenServiceHoursConfig drops an empty custom config; the
    # subsequent resolver then inherits effective Kitchen hours.
    return None


def service_hours(raw, kitchen, place):
    custom = custom_service_hours(raw)
    if custom:
        return custom
    custom = kitchen_custom_hours(kitchen)
    if custom:
        return custom
    if not place:
        return None
    hours = field(place, 'business_hours', {})
    if not hours or not hours.get('windows'):
        return None
    return normalize_hours({**hours, 'timezone': field(place, 'timezone', '')}, 'place', True)


def validate_named_services(value):
    seen = set()
    for service in array_values(value):
        fields = map_fields(service)
        sid = field(fields, 'id')
        if not isinstance(sid, str) or not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9_-]*', sid) or sid in seen:
            raise ValueError('Invalid or duplicate named service id')
        seen.add(sid)
        if not isinstance(field(fields, 'name'), str) or not field(fields, 'name').strip():
            raise ValueError('Named service requires a name')
        if type(field(fields, 'enabled')) is not bool:
            raise ValueError('Named service requires explicit enabled state')
        menu_ids = field(fields, 'menu_ids')
        if not isinstance(menu_ids, list) or any(not isinstance(mid, str) or not mid or '/' in mid for mid in menu_ids):
            raise ValueError('Invalid Menu ids')
        kinds = set()
        active_ordering = False
        for interaction in array_values(fields.get('interactions')):
            policy = map_fields(interaction)
            kind = field(policy, 'type')
            if kind not in {'browse', *LABELS} or kind in kinds or type(field(policy, 'enabled')) is not bool:
                raise ValueError('Invalid or duplicate interaction')
            kinds.add(kind)
            active_ordering |= kind != 'browse' and field(policy, 'enabled')
        if 'hours' in fields:
            normalize_hours(field(fields, 'hours'))
        elif field(fields, 'enabled') and active_ordering:
            raise ValueError('Enabled ordering service has unresolved hours')


def build_plan(inventory):
    kitchens = inventory.get('kitchens', [])
    if len(kitchens) != 1:
        raise ValueError('Exactly one Kitchen is required')
    kitchen = kitchens[0]
    name = kitchen['name']
    kid = name.split('/')[-1]
    runner.validate_id(kid)
    if name != f'{TARGET}/documents/kitchens/{kid}':
        raise ValueError('Unexpected Kitchen target')
    places = inventory.get('places', [])
    if len(places) > 1 or any(p['name'] != f'{TARGET}/documents/places/{kid}' for p in places):
        raise ValueError('Only the exact same-id Place is allowed')
    plan = {'target': TARGET, 'kitchen_id': kid, 'changes': [], 'issues': [], 'dependencies': places}
    before = kitchen.get('fields', {})
    try:
        if 'services' in before:
            if 'ordering' in before:
                raise ValueError('Both old ordering and named services exist; review conflict')
            validate_named_services(before['services'])
            return plan
        if 'ordering' not in before:
            return plan
        ordering = map_fields(before['ordering'])
        if set(ordering) != {'services'}:
            raise ValueError('Unexpected legacy ordering fields; review before retirement')
        services, modes = [], set()
        for old in array_values(ordering['services']):
            raw = map_fields(old)
            mode, enabled = field(raw, 'type'), field(raw, 'enabled')
            if mode not in LABELS or mode in modes:
                raise ValueError('Unknown or duplicate old service mode')
            if type(enabled) is not bool:
                raise ValueError('Old service requires explicit enabled state')
            modes.add(mode)
            hours = service_hours(raw, before, places[0].get('fields', {}) if places else None)
            if enabled and not hours:
                raise ValueError(f'Enabled {mode} service has unresolved hours')
            policy = {k: deepcopy(v) for k, v in raw.items() if k not in {'menu_ids', 'service_hours'}}
            named = {
                'id': encode('service-' + mode.replace('_', '-')),
                'name': encode(LABELS[mode]), 'enabled': deepcopy(raw['enabled']),
                'menu_ids': deepcopy(raw['menu_ids']),
                'interactions': {'arrayValue': {'values': [
                    encode({'type': 'browse', 'enabled': True}), {'mapValue': {'fields': policy}},
                ]}},
            }
            if hours:
                named['hours'] = encode(hours)
            services.append({'mapValue': {'fields': named}})
        result = {'arrayValue': {'values': services}}
        validate_named_services(result)
        after = deepcopy(before)
        after['services'] = result
        del after['ordering']
        plan['changes'].append({
            'name': name, 'updateTime': kitchen['updateTime'], 'before': before,
            'after': after, 'changed': ['ordering', 'services'],
        })
    except (ValueError, TypeError, KeyError, AttributeError) as error:
        plan['issues'].append({'path': name, 'reason': str(error)})
    return plan


if __name__ == '__main__':
    runner.run(build_plan, needs_place, [__file__, runner.__file__, runner.guarded.__file__])
