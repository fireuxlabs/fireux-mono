"""Apply a reviewed Dish-pricing plan with exact preimages and sparse writes.

Only Kitchen Dish pricing fields and Menu-placement pricing fields are writable.
Each Kitchen commits atomically; all current preimages are checked before any commit.
Order paths, ordinary prices, options and extras cannot be authored by this tool.
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from datetime import datetime, timezone

DATABASE = 'projects/misebox-78f9c/databases/misebox'
TERMS = ('price', 'price_options', 'add_ons')


def encode(value):
    if value is None:
        return {'nullValue': None}
    if isinstance(value, bool):
        return {'booleanValue': value}
    if isinstance(value, int):
        return {'integerValue': str(value)}
    if isinstance(value, float):
        return {'doubleValue': value}
    if isinstance(value, str):
        return {'stringValue': value}
    if isinstance(value, list):
        return {'arrayValue': {'values': [encode(item) for item in value]}}
    if isinstance(value, dict):
        return {'mapValue': {'fields': {key: encode(item) for key, item in value.items()}}}
    raise ValueError('Unsupported value')


def build_write(change, stamp):
    path = change['path']
    is_dish = bool(re.fullmatch(r'kitchens/[^/]+/dishes/[^/]+', path))
    is_placement = bool(re.fullmatch(r'kitchens/[^/]+/menus/[^/]+/sections/[^/]+/items/[^/]+', path))
    if not (is_dish or is_placement):
        raise ValueError('Unsupported migration target')
    before, after = change['before'], change['after']
    if {k: v for k, v in before.items() if k not in TERMS} != {k: v for k, v in after.items() if k not in TERMS}:
        raise ValueError('Only pricing ownership may change')
    if is_dish:
        if not all(key in after for key in TERMS):
            raise ValueError('Dish needs complete pricing')
        fields = {key: encode(after[key]) for key in TERMS}
    else:
        if any(key in after for key in TERMS):
            raise ValueError('Placement pricing must be removed')
        fields = {}
    fields['updated'] = {'mapValue': {'fields': {
        'at': {'timestampValue': stamp},
        'by': {'stringValue': 'system:move-pricing-to-dish'},
        'app_id': {'stringValue': 'misebox-app'},
    }}}
    return {
        'update': {'name': DATABASE + '/documents/' + path, 'fields': fields},
        'updateMask': {'fieldPaths': [*TERMS, 'updated']},
        'currentDocument': {'updateTime': change['updateTime']},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plans', required=True)
    parser.add_argument('--confirm-sha256', required=True)
    parser.add_argument('--backup-directory', required=True)
    args = parser.parse_args()
    content = Path(args.plans).read_bytes()
    if hashlib.sha256(content).hexdigest() != args.confirm_sha256:
        raise ValueError('Reviewed plan hash does not match')
    plans = json.loads(content)
    stamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    batches = [[build_write(change, stamp) for change in plan['changes']] for plan in plans]
    if any(len(batch) > 450 for batch in batches):
        raise ValueError('Kitchen exceeds the atomic commit limit')
    # Every new Dish value must exactly equal the terms of every current placement.
    for plan in plans:
        terms_by_dish = {change['path'].split('/')[-1]: {key: change['after'][key] for key in TERMS}
                         for change in plan['changes'] if '/dishes/' in change['path']}
        for change in plan['changes']:
            if '/items/' in change['path']:
                old = change['before']
                expected = {'price': old.get('price', 0), 'price_options': old.get('price_options', []), 'add_ons': old.get('add_ons', [])}
                if terms_by_dish[old['dish_id']] != expected:
                    raise ValueError('The plan changes a current price or option')
    token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()
    def request(path, body=None):
        config = 'header = "Authorization: Bearer ' + token + '"\n'
        command = ['curl', '--fail', '--silent', '--show-error', '--config', '-']
        if body is not None:
            command += ['--request', 'POST', '--header', 'Content-Type: application/json', '--data-binary', json.dumps(body)]
        command += ['https://firestore.googleapis.com/v1/' + path]
        response = subprocess.run(command, input=config, text=True, capture_output=True, check=True)
        return json.loads(response.stdout)
    changes = [change for plan in plans for change in plan['changes']]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        current = list(pool.map(lambda change: request(DATABASE + '/documents/' + change['path']), changes))
    if any(doc['updateTime'] != change['updateTime'] for change, doc in zip(changes, current)):
        raise ValueError('A source record changed. Refresh and review the plan.')
    os.umask(0o077)
    backup = Path(args.backup_directory)
    backup.mkdir(parents=True, exist_ok=False, mode=0o700)
    (backup / 'preimages.json').write_text(json.dumps(current, indent=2))
    (backup / 'plans.json').write_bytes(content)
    reports = []
    for plan, writes in zip(plans, batches):
        result = request(DATABASE + '/documents:commit', {'writes': writes})
        reports.append({'kitchenId': plan['kitchenId'], 'writes': len(writes), 'commitTime': result['commitTime']})
        (backup / 'commits.json').write_text(json.dumps(reports, indent=2))
    print(json.dumps({'backup': str(backup), 'commits': reports}, indent=2))


if __name__ == '__main__':
    main()
