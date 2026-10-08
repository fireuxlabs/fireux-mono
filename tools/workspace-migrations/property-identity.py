"""Offline Property cutover proposal over a supplied JSON inventory. No network or apply mode."""
import argparse
import copy
import hashlib
import json
import math
import os
import re
from pathlib import Path

ROOT_KEYS = {'id', 'portfolio_id', 'place_id', 'management', 'identity', 'valuation', 'created', 'updated'}
PUBLICATION_KEYS = {'slug', 'status', 'publication_state'}
IDENTITY_KEYS = {'name', 'image_url', 'property_type', 'unit_count'} | PUBLICATION_KEYS
OLD_PRICE_KEYS = {'estimated_value', 'estimated_value_currency'}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def propose(root):
    """Return a proposal, never a compatibility reader or an applied migration."""
    if not isinstance(root, dict) or set(root) - (ROOT_KEYS | PUBLICATION_KEYS):
        raise ValueError('Unsupported Property root fields')
    identity = root.get('identity')
    if not isinstance(identity, dict) or set(identity) - (IDENTITY_KEYS | OLD_PRICE_KEYS):
        raise ValueError('Unsupported Property identity fields')
    old_publication = PUBLICATION_KEYS & set(root)
    old_prices = OLD_PRICE_KEYS & set(identity)
    if not old_publication and not old_prices:
        return 'already_nested', copy.deepcopy(root), []
    if old_publication != PUBLICATION_KEYS:
        raise ValueError('Incomplete old publication fields')
    if PUBLICATION_KEYS & set(identity):
        raise ValueError('Conflicting old and nested publication authorities')
    if 'valuation' in root and old_prices:
        raise ValueError('Conflicting old and separate valuation authorities')
    after = copy.deepcopy(root)
    for key in PUBLICATION_KEYS:
        after['identity'][key] = after.pop(key)
    warnings = []
    if old_prices:
        if old_prices != OLD_PRICE_KEYS:
            raise ValueError('Incomplete old valuation fields')
        amount = after['identity'].pop('estimated_value')
        currency = after['identity'].pop('estimated_value_currency')
        if not isinstance(currency, str):
            raise ValueError('Valuation currency is not text')
        currency = currency.strip().upper()
        if currency and not re.fullmatch('[A-Z]{3}', currency):
            raise ValueError('Valuation currency is invalid')
        if amount is not None and (isinstance(amount, bool) or not isinstance(amount, (int, float)) or not math.isfinite(amount) or amount < 0):
            raise ValueError('Valuation amount is invalid')
        if amount is not None and not currency:
            # Former defaults cannot establish a financial fact. Keep the full preimage,
            # but do not propose an invented currency, unknown amount or silent deletion.
            return 'review_required', None, ['Old valuation has an amount without a currency; decide its meaning explicitly.']
        after['valuation'] = {'estimated_value': amount, 'currency_code': currency}
        if amount == 0:
            warnings.append('Confirm the old zero valuation was explicit rather than a creation default.')
    return ('review_required' if warnings else 'proposed'), after, warnings


def build_plan(inventory):
    target = inventory.get('database')
    if not isinstance(target, str) or not re.fullmatch(r'projects/[^/]+/databases/[^/]+', target):
        raise ValueError('An explicit project and named database are required')
    documents = inventory.get('documents')
    if not isinstance(documents, list):
        raise ValueError('documents must be a list of ordinary JSON Property roots')
    entries, seen = [], set()
    for document in documents:
        if not isinstance(document, dict):
            raise ValueError('Invalid inventory document')
        path = document.get('path')
        if not isinstance(path, str) or not re.fullmatch(r'properties/[^/]+', path) or path in seen:
            raise ValueError('Each exact Property document path must be unique')
        seen.add(path)
        before = copy.deepcopy(document.get('data'))
        if not isinstance(before, dict) or ('id' in before and before['id'] != path.split('/')[1]):
            raise ValueError('A present stored Property id must match the inventory path')
        entry = {'path': path, 'preimage': before, 'preimage_sha256': digest(before), 'update_time': document.get('update_time')}
        try:
            status, after, warnings = propose(before)
            entry.update(status=status, proposed=after, warnings=warnings)
            if after is not None:
                entry['proposed_sha256'] = digest(after)
        except ValueError as error:
            entry.update(status='invalid', proposed=None, warnings=[str(error)])
        entries.append(entry)
    return {'database': target, 'offline_only': True, 'apply_supported': False,
            'target_validation_required': True, 'entries': entries}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    plan = build_plan(json.loads(args.input.read_text()))
    # Never overwrite an existing review artifact or the input inventory.
    with os.fdopen(os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w') as output:
        output.write(json.dumps(plan, indent=2, allow_nan=False) + '\n')
    print(json.dumps({'documents': len(plan['entries']), 'offline_only': True}))


if __name__ == '__main__':
    main()
