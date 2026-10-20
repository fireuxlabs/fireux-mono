"""Migrate reviewed App context from App-owned configuration to existing roots.

Plan is read-only remotely. Apply accepts an exact plan hash, rechecks every
preimage, commits only context with update-time preconditions, and verifies all
other fields. No App creation, deletion, Rules, orders or relationship changes.
"""
import argparse
import ast
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]

def digest(value):
    return hashlib.sha256(value).hexdigest()

def text(source, key):
    match = re.search(r'\b' + key + r":\s*'([^']*)'", source)
    if not match:
        raise ValueError('Missing configuration ' + key)
    return match.group(1)

def inventory():
    result = []
    for config in sorted((ROOT / 'projects').glob('*/*/nuxt.config.ts')):
        source = config.read_text()
        context = re.search(r"\bcontext:\s*(\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*')", source)
        if not context:
            raise ValueError('App lacks an explicitly authored context: ' + str(config.relative_to(ROOT)))
        context = ast.literal_eval(context.group(1))
        if not context or len(context) > 32000:
            raise ValueError('Invalid context')
        ecosystem = text(source, 'ecosystem')
        binding_path = ROOT / f'packages/ecosystem/fireux-{ecosystem}/src/config/firebase/ecosystem.config.ts'
        binding = binding_path.read_text()
        override = re.search(r"\bdatabaseId:\s*'([^']+)'", source)
        database = override.group(1) if override else text(binding, 'databaseId')
        result.append({
            'name': f"projects/{text(binding, 'projectId')}/databases/{database}/documents/apps/{text(source, 'id')}",
            'appId': text(source, 'id'), 'appName': text(source, 'name'), 'ecosystemId': text(source, 'ecosystemId'),
            'role': text(source, 'role'), 'context': context,
            'source': str(config.relative_to(ROOT)), 'sourceSha256': digest(config.read_bytes()),
            'binding': str(binding_path.relative_to(ROOT)), 'bindingSha256': digest(binding_path.read_bytes()),
        })
    names = [row['name'] for row in result]
    if len(names) != len(set(names)):
        raise ValueError('Duplicate App target')
    return result

class Firestore:
    def __init__(self):
        self.token = subprocess.check_output(['gcloud', 'auth', 'print-access-token'], text=True, stderr=subprocess.PIPE).strip()
    def request(self, path, body=None):
        command = ['curl', '--silent', '--show-error', '--config', '-', '--write-out', '\n%{http_code}']
        if body is not None:
            command += ['--request', 'POST', '--header', 'Content-Type: application/json', '--data-binary', json.dumps(body)]
        command += ['https://firestore.googleapis.com/v1/' + path]
        response = subprocess.run(command, input='header = "Authorization: Bearer ' + self.token + '"\n', text=True, capture_output=True, check=True)
        payload, status = response.stdout.rsplit('\n', 1)
        if status == '404':
            return None
        if not status.startswith('2'):
            raise RuntimeError('Firestore request failed: HTTP ' + status + ' at ' + path)
        return json.loads(payload)

def build_write(change):
    name = change['target']['name']
    if not re.fullmatch(r'projects/[^/]+/databases/[^/]+/documents/apps/[^/]+', name):
        raise ValueError('Only exact App roots may be updated')
    return {'update': {'name': name, 'fields': {'context': {'stringValue': change['target']['context']}}},
            'updateMask': {'fieldPaths': ['context']},
            'currentDocument': {'updateTime': change['before']['updateTime']}}

def write_protected(path, value):
    os.umask(0o077)
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with path.open('x') as file:
        json.dump(value, file, indent=2, ensure_ascii=False)
        file.write('\n')

def plan(client, rows):
    databases = sorted({row['name'].split('/documents/')[0] for row in rows})
    details = [client.request(database) for database in databases]
    if any(detail is None or detail.get('type') != 'FIRESTORE_NATIVE' for detail in details):
        raise ValueError('Every target must be an existing native Firestore database')
    with ThreadPoolExecutor(max_workers=4) as pool:
        documents = list(pool.map(lambda row: client.request(row['name']), rows))
    changes, missing, unchanged, conflicts, warnings = [], [], [], [], []
    for row, before in zip(rows, documents):
        if before is None:
            missing.append(row['appId'])
            continue
        fields = before.get('fields', {})
        stored_ecosystem = fields.get('ecosystem_id', {}).get('stringValue')
        if (stored_ecosystem and stored_ecosystem != row['ecosystemId']) or fields.get('role', {}).get('stringValue') != row['role']:
            conflicts.append({'appId': row['appId'], 'reason': 'Stored relationship or role differs from App configuration'})
            continue
        if not stored_ecosystem:
            if fields.get('name', {}).get('stringValue') != row['appName']:
                conflicts.append({'appId': row['appId'], 'reason': 'App identity is unconfirmed'})
                continue
            warnings.append({'appId': row['appId'], 'reason': 'Existing root lacks ecosystem_id; context only, relationship left unchanged'})
        if 'context' in fields and 'stringValue' not in fields['context']:
            conflicts.append({'appId': row['appId'], 'reason': 'Existing context is not text; preserved'})
            continue
        current = fields.get('context', {}).get('stringValue', '')
        if current == row['context']:
            unchanged.append(row['appId'])
        elif current:
            conflicts.append({'appId': row['appId'], 'reason': 'Existing authored context differs; preserved'})
        else:
            changes.append({'target': row, 'before': before})
    return {'migrationSourceSha256': digest(Path(__file__).read_bytes()), 'inventory': rows, 'databases': details, 'changes': changes, 'missing': missing, 'unchanged': unchanged, 'conflicts': conflicts, 'warnings': warnings}

def apply(client, value, on_commit=None):
    if value['inventory'] != inventory():
        raise ValueError('Source or target inventory changed; refresh the plan')
    changes = value['changes']
    for change in changes:
        build_write(change)
        if client.request(change['target']['name']) != change['before']:
            raise ValueError('Source record changed; refresh the plan')
    results = []
    for database in sorted({change['target']['name'].split('/documents/')[0] for change in changes}):
        batch = [change for change in changes if change['target']['name'].startswith(database + '/documents/')]
        client.request(database + '/documents:commit', {'writes': [build_write(change) for change in batch]})
        for change in batch:
            after = client.request(change['target']['name'])
            expected = {**change['before']['fields'], 'context': {'stringValue': change['target']['context']}}
            if after is None or after.get('fields') != expected:
                raise ValueError('Postimage mismatch for ' + change['target']['appId'])
            results.append({'appId': change['target']['appId'], 'name': after['name'], 'updateTime': after['updateTime']})
        if on_commit:
            on_commit(results)
    return results

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan', 'apply'])
    parser.add_argument('--plan', required=True, type=Path)
    parser.add_argument('--confirm-sha256')
    args = parser.parse_args()
    if args.mode == 'plan':
        value = plan(Firestore(), inventory())
        write_protected(args.plan, value)
        print(json.dumps({'plan': str(args.plan), 'sha256': digest(args.plan.read_bytes()),
                          'changes': [change['target']['appId'] for change in value['changes']],
                          **{key: value[key] for key in ['missing', 'unchanged', 'conflicts', 'warnings']}}, indent=2))
    else:
        data = args.plan.read_bytes()
        if not args.confirm_sha256 or digest(data) != args.confirm_sha256:
            raise ValueError('Reviewed plan hash does not match')
        report_path = args.plan.with_suffix('.applied.json')
        if report_path.exists():
            raise ValueError('Apply report already exists')
        value = json.loads(data)
        if value.get('migrationSourceSha256') != digest(Path(__file__).read_bytes()):
            raise ValueError('Migration source changed; refresh the plan')
        progress = args.plan.with_suffix('.progress.json')
        write_protected(progress, [])
        results = apply(Firestore(), value, lambda rows: progress.write_text(json.dumps(rows, indent=2) + '\n'))
        write_protected(report_path, results)
        print(json.dumps({'verified': results, 'report': str(report_path)}, indent=2))

if __name__ == '__main__':
    main()
