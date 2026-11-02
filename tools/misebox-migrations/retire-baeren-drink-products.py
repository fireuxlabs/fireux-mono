"""Exact Bären seed-duplicate retirement. No runtime, provider or generic write API."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import ssl
import subprocess
import urllib.error
import urllib.parse
import urllib.request

TARGET = 'projects/misebox-78f9c/databases/misebox'
API = 'https://firestore.googleapis.com/v1/'
BASE = API + TARGET + '/documents'
KITCHEN = 'ChIJE-GP3-Kjj0cRzAv0WviwcsY'
ACTOR = 'system:seed-baeren-ringgenberg-ordering-menu'
BACKUP = 'gs://misebox-78f9c-firestore-migrations/'
# Explicit reviewed identities. Matching never runs by name or price during apply.
MAPPING = {'baeren-ringgenberg-ananassaft': {'deposit': 10.0, 'dish': 'ananassaft-5-dl'},
 'baeren-ringgenberg-apfelschorle': {'deposit': 10.0, 'dish': 'apfelschorle-5-dl'},
 'baeren-ringgenberg-bahama-mamma': {'deposit': 0.0, 'dish': 'bahama-mamma'},
 'baeren-ringgenberg-banana-colada': {'deposit': 0.0, 'dish': 'banana-colada'},
 'baeren-ringgenberg-bitter-lemon': {'deposit': 10.0, 'dish': 'bitter-lemon-5-dl'},
 'baeren-ringgenberg-caipirinha': {'deposit': 0.0, 'dish': 'caipirinha'},
 'baeren-ringgenberg-citro': {'deposit': 10.0, 'dish': 'citro-5-dl'},
 'baeren-ringgenberg-coconut-kiss-ohne-alkohol': {'deposit': 0.0,
                                                  'dish': 'coconut-kiss-ohne-alkohol'},
 'baeren-ringgenberg-cola-5dl': {'deposit': 10.0, 'dish': 'cola-5-dl'},
 'baeren-ringgenberg-cola-zero': {'deposit': 10.0, 'dish': 'cola-zero-5-dl'},
 'baeren-ringgenberg-cuba-libre': {'deposit': 0.0, 'dish': 'cuba-libre'},
 'baeren-ringgenberg-ginger-ale': {'deposit': 10.0, 'dish': 'ginger-ale-5-dl'},
 'baeren-ringgenberg-holunderbluete': {'deposit': 10.0, 'dish': 'holunderbluete-5-dl'},
 'baeren-ringgenberg-ice-tea-lemon': {'deposit': 10.0, 'dish': 'ice-tea-lemon-5-dl'},
 'baeren-ringgenberg-italien-colada': {'deposit': 0.0, 'dish': 'italien-colada'},
 'baeren-ringgenberg-mai-tai': {'deposit': 0.0, 'dish': 'mai-tai'},
 'baeren-ringgenberg-mineral-5dl': {'deposit': 10.0, 'dish': 'mineral-5-dl'},
 'baeren-ringgenberg-mojito': {'deposit': 0.0, 'dish': 'mojito'},
 'baeren-ringgenberg-orange': {'deposit': 10.0, 'dish': 'orange-5-dl'},
 'baeren-ringgenberg-orangensaft': {'deposit': 10.0, 'dish': 'orangensaft-5-dl'},
 'baeren-ringgenberg-pina-colada': {'deposit': 0.0, 'dish': 'pina-colada'},
 'baeren-ringgenberg-red-bull-dose': {'deposit': 0.0, 'dish': 'red-bull-dose'},
 'baeren-ringgenberg-rugenbraeu-lager-5dl-dose': {'deposit': 0.0,
                                                  'dish': 'rugenbraeu-lager-5-dl-dose'},
 'baeren-ringgenberg-sex-on-the-beach': {'deposit': 0.0, 'dish': 'sex-on-the-beach'},
 'baeren-ringgenberg-tonic': {'deposit': 10.0, 'dish': 'tonic-5-dl'}}
REFERENCE_FIELDS = {
    'items': ['product_id', 'productId', 'dish_id', 'promotion_id', 'item_type'],
    'ingredients': ['product_id', 'preferred_product_id'],
    'dishes': ['product_id', 'source_product_id'],
    'submitted-orders': ['order.lines', 'pricing', 'source'],
    'order-drafts': ['order.lines', 'lines'],
    'orders': ['lines', 'items', 'order.lines', 'pricing'],
    'sales': ['lines', 'items', 'order.lines'],
}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def decode(value):
    if 'mapValue' in value:
        return {k: decode(v) for k, v in value['mapValue'].get('fields', {}).items()}
    if 'arrayValue' in value:
        return [decode(v) for v in value['arrayValue'].get('values', [])]
    return next(iter(value.values()), None)


def data(document):
    return {k: decode(v) for k, v in document.get('fields', {}).items()}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def save(directory, name, value):
    path = directory / name
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
    return path


class Firestore:
    def __init__(self):
        self.token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True).strip()
        self.context = ssl.create_default_context(cafile='/etc/ssl/cert.pem')

    def request(self, url, body=None):
        request = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(), headers={
            'Authorization': 'Bearer ' + self.token, 'Content-Type': 'application/json',
        })
        with urllib.request.urlopen(request, context=self.context, timeout=90) as response:
            return json.load(response)

    def get(self, name):
        require(name.startswith(TARGET + '/documents/'), 'Wrong database')
        try:
            return self.request(API + name)
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
            raise

    def listing(self, path):
        rows, page = [], ''
        while True:
            result = self.request(BASE + '/' + path + '?' + urllib.parse.urlencode({'pageSize': 300, **({'pageToken': page} if page else {})}))
            rows.extend(result.get('documents', []))
            page = result.get('nextPageToken')
            if not page:
                return rows
            require(len(rows) < 5000, 'Listing exceeded reviewed bound')

    def group(self, collection, fields=None, parent='', transaction=None):
        query = {'from': [{'collectionId': collection, 'allDescendants': True}], 'limit': 5001}
        if fields:
            query['select'] = {'fields': [{'fieldPath': field} for field in fields]}
        result = self.request(BASE + parent + ':runQuery', {'structuredQuery': query, **({'transaction': transaction} if transaction else {})})
        rows = [row['document'] for row in result if 'document' in row]
        require(len(rows) <= 5000, 'Query exceeded reviewed bound')
        return rows

    def children(self, name):
        result = self.request(API + name + ':listCollectionIds', {'pageSize': 100})
        require(not result.get('nextPageToken'), 'Unexpected child collection count')
        return sorted(result.get('collectionIds', []))


def reference_hits(value):
    if isinstance(value, dict):
        return any(reference_hits(v) for v in value.values())
    if isinstance(value, list):
        return any(reference_hits(v) for v in value)
    return isinstance(value, str) and (value in MAPPING or any(value.endswith('/products/' + key) for key in MAPPING))


def audit_references(db, transaction=None):
    counts = {}
    for collection, fields in REFERENCE_FIELDS.items():
        rows = db.group(collection, fields, transaction=transaction)
        hits = [row['name'] for row in rows if reference_hits(data(row))]
        require(not hits, 'Live Product reference found: ' + ', '.join(hits))
        counts[collection] = len(rows)
    return counts


def target_names():
    return {TARGET + '/documents/products/' + key + suffix for key in MAPPING for suffix in ['', '/prices/default']}


def build_plan(inventory, source_hash, backup_prefix):
    products = {row['name'].split('/')[-1]: row for row in inventory['products']}
    dishes = {row['name'].split('/')[-1]: row for row in inventory['dishes']}
    require({key for key in products if key.startswith('baeren-ringgenberg-')} == set(MAPPING), 'Drink identity set changed')
    retire, preserved, comparisons = [], [], []
    require(backup_prefix.startswith(BACKUP) and '/drink-product-retirement-' in backup_prefix, 'Wrong backup destination')
    for key, mapping in MAPPING.items():
        product = products[key]
        value = data(product)
        require(value.get('owner_type') == 'kitchen' and value.get('owner_id') == KITCHEN, 'Product owner changed: ' + key)
        require(value.get('source_app_id') == 'misebox-app' and value.get('product_type') in ['drink', 'age-restricted-drink'], 'Product scope changed: ' + key)
        require(value.get('created', {}).get('by') == ACTOR and value.get('updated', {}).get('by') == ACTOR, 'Product provenance changed: ' + key)
        require(value.get('metadata', {}).get('source') == 'Hotel Baeren Ringgenberg current ordering system paste.', 'Seed provenance missing: ' + key)
        require(value.get('metadata', {}).get('kitchen_id') == KITCHEN and value.get('metadata', {}).get('menu_id') == 'delivery-ordering', 'Seed target changed: ' + key)
        require(inventory['children'][key] == ['prices'], 'Unexpected Product children: ' + key)
        prices = inventory['prices'][key]
        require(len(prices) == 1 and prices[0]['name'] == product['name'] + '/prices/default', 'Unexpected price set: ' + key)
        price = data(prices[0])
        require(inventory['priceChildren'][key] == [], 'Unexpected price children: ' + key)
        require(price.get('provider') == 'manual' and not price.get('provider_price_id'), 'Provider-linked price: ' + key)
        require(not value.get('provider_product_id') and not value.get('stripe_product_id'), 'Provider-linked Product: ' + key)
        require(price.get('currency', '').lower() == 'chf' and price.get('product_id') == key, 'Price identity changed: ' + key)
        dish = dishes.get(mapping['dish'])
        require(dish and dish['name'] == TARGET + '/documents/kitchens/' + KITCHEN + '/dishes/' + mapping['dish'], 'Canonical item missing: ' + key)
        terms = data(dish)
        require(terms.get('item_kind') == 'drink', 'Canonical item is not drink: ' + key)
        require(round(float(terms.get('price', -1)) * 100) == int(price.get('unit_amount', -2)), 'Base price differs: ' + key)
        require(float(terms.get('bottle_deposit', 0)) == mapping['deposit'], 'Deposit differs: ' + key)
        require(not terms.get('add_ons'), 'Review changed item add-ons: ' + key)
        # Canonical cocktail sizes are richer than the retired default price.
        # Preserve every option verbatim; no Menu commercial term is migrated.
        published = {row['name'] for row in inventory['menus'] if data(row).get('status') == 'published'}
        placements = [row for row in inventory['items'] if data(row).get('dish_id') == mapping['dish'] and data(row).get('status') == 'active' and row['name'].split('/sections/')[0] in published]
        require(placements, 'No active published Menu placement: ' + key)
        retire.extend([product, prices[0]])
        comparisons.append({'product': product['name'], 'dish': dish['name'], 'basePriceMinor': int(price['unit_amount']), 'bottleDeposit': mapping['deposit'], 'publishedPlacements': [row['name'] for row in placements]})
    preserved.extend(row for key, row in products.items() if key not in MAPPING)
    for key in ['dishes', 'menus', 'sections', 'items', 'kitchen', 'place']:
        preserved.extend(inventory[key])
    require({row['name'] for row in retire} == target_names(), 'Unexpected retirement set')
    return {'target': TARGET, 'sourceHash': source_hash, 'backupPrefix': backup_prefix, 'retire': retire, 'preserved': preserved, 'comparisons': comparisons, 'referenceCounts': inventory['referenceCounts']}


def inventory(db):
    result = {'products': db.listing('products'), 'prices': {}, 'children': {}, 'priceChildren': {}}
    def product_children(key):
        name = TARGET + '/documents/products/' + key
        return key, db.listing('products/' + key + '/prices'), db.children(name), db.children(name + '/prices/default')
    with ThreadPoolExecutor(max_workers=5) as pool:
        for key, prices, children, price_children in pool.map(product_children, MAPPING):
            result['prices'][key], result['children'][key], result['priceChildren'][key] = prices, children, price_children
    for collection in ['dishes', 'menus', 'sections', 'items']:
        result[collection] = db.group(collection, parent='/kitchens/' + KITCHEN)
    result['kitchen'] = [db.get(TARGET + '/documents/kitchens/' + KITCHEN)]
    result['place'] = [db.get(TARGET + '/documents/places/' + KITCHEN)]
    require(all(result['kitchen'] + result['place']), 'Kitchen or Place missing')
    result['referenceCounts'] = audit_references(db)
    return result


def validate_plan(plan, source_hash):
    require(plan['target'] == TARGET and plan['sourceHash'] == source_hash, 'Target or source changed')
    require({row['name'] for row in plan['retire']} == target_names() and len(plan['retire']) == 50, 'Only exact 50 documents may retire')
    require(all(row.get('updateTime') for row in plan['retire'] + plan['preserved']), 'Unversioned preimage')
    require(len(plan['comparisons']) == 25, 'Incomplete canonical verification')


def require_export(db, plan, operation):
    require(operation and operation.startswith(TARGET + '/operations/'), 'Exact managed-export operation required')
    receipt = db.request(API + operation)
    metadata = receipt.get('metadata', {})
    require(receipt.get('done') and not receipt.get('error'), 'Export has not completed successfully')
    require(metadata.get('outputUriPrefix', '').rstrip('/') == plan['backupPrefix'].rstrip('/'), 'Export destination differs')
    require({'products', 'prices'}.issubset(metadata.get('collectionIds', [])), 'Export scope incomplete')
    return receipt


def apply_plan(db, plan, directory):
    transaction = db.request(BASE + ':beginTransaction', {})['transaction']
    try:
        records = plan['retire'] + plan['preserved']
        current = db.request(BASE + ':batchGet', {'documents': [row['name'] for row in records], 'transaction': transaction})
        found = {row['found']['name']: row['found'] for row in current if 'found' in row}
        for expected in records:
            actual = found.get(expected['name'])
            require(actual and actual['updateTime'] == expected['updateTime'] and actual.get('fields', {}) == expected.get('fields', {}), 'Record changed since plan: ' + expected['name'])
        references = audit_references(db, transaction)
        # CAS and the transaction protect both deletion targets and canonical dependencies.
        writes = [{'delete': row['name'], 'currentDocument': {'updateTime': row['updateTime']}} for row in plan['retire']]
        save(directory, 'apply-attempt.json', {'planHash': digest(plan), 'deletes': [row['name'] for row in plan['retire']], 'referenceCounts': references})
        receipt = db.request(BASE + ':commit', {'transaction': transaction, 'writes': writes})
        save(directory, 'commit-receipt.json', receipt)
        return {'retired': len(writes), 'commitTime': receipt.get('commitTime')}
    except Exception:
        try:
            db.request(BASE + ':rollback', {'transaction': transaction})
        except Exception:
            pass
        raise


def verify(db, plan):
    with ThreadPoolExecutor(max_workers=5) as pool:
        rows = list(pool.map(db.get, [row['name'] for row in plan['retire'] + plan['preserved']]))
    absent = rows[:50]
    require(not any(absent), 'A retired document still exists')
    for actual, expected in zip(rows[50:], plan['preserved']):
        require(actual and actual.get('fields', {}) == expected.get('fields', {}), 'Preserved record changed: ' + expected['name'])
    require(not any(row['name'].split('/')[-1] in MAPPING for row in db.listing('products')), 'A duplicate Product remains')
    return {'retiredDocumentsAbsent': 50, 'preservedDocumentsVerified': len(plan['preserved']), 'references': audit_references(db)}


def restore(db, plan, directory):
    # Recovery is explicit and create-only; never overwrite subsequent work.
    writes = [{'update': {'name': row['name'], 'fields': row.get('fields', {})}, 'currentDocument': {'exists': False}} for row in plan['retire']]
    save(directory, 'restore-attempt.json', {'planHash': digest(plan), 'creates': [row['name'] for row in plan['retire']]})
    receipt = db.request(BASE + ':commit', {'writes': writes})
    save(directory, 'restore-receipt.json', receipt)
    for expected in plan['retire']:
        actual = db.get(expected['name'])
        require(actual and actual.get('fields', {}) == expected.get('fields', {}), 'Restore verification failed: ' + expected['name'])
    return {'restored': len(writes), 'preimagesVerified': len(writes)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan', 'apply', 'verify', 'restore'])
    parser.add_argument('--directory', required=True)
    parser.add_argument('--backup-prefix')
    parser.add_argument('--confirm')
    parser.add_argument('--export-operation')
    args = parser.parse_args()
    os.umask(0o077)
    directory = Path(args.directory)
    db = Firestore()
    source_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    if args.mode == 'plan':
        directory.mkdir(mode=0o700, parents=True, exist_ok=False)
        snapshot = inventory(db)
        save(directory, 'preimages.json', snapshot)
        require(args.backup_prefix, 'Backup prefix required')
        plan = build_plan(snapshot, source_hash, args.backup_prefix)
        save(directory, 'plan.json', plan)
        print(json.dumps({'planHash': digest(plan), 'documentsToRetire': len(plan['retire']), 'preservedDocuments': len(plan['preserved']), 'verifiedMappings': len(plan['comparisons']), 'referenceCounts': plan['referenceCounts']}))
        return
    plan = json.loads((directory / 'plan.json').read_text())
    validate_plan(plan, source_hash)
    snapshot = json.loads((directory / 'preimages.json').read_text())
    require(build_plan(snapshot, source_hash, plan['backupPrefix']) == plan, 'Plan differs from verified preimages')
    if args.mode in ['apply', 'restore']:
        require(args.confirm == digest(plan), 'Exact confirmation hash required')
        receipt = require_export(db, plan, args.export_operation)
        if not (directory / 'managed-export.json').exists():
            save(directory, 'managed-export.json', receipt)
        result = apply_plan(db, plan, directory) if args.mode == 'apply' else restore(db, plan, directory)
        print(json.dumps(result))
    if args.mode != 'restore':
        report = verify(db, plan)
        save(directory, 'verification-' + os.urandom(4).hex() + '.json', report)
        print(json.dumps(report))


if __name__ == '__main__':
    main()
