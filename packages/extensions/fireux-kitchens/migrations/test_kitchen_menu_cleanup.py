import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('migration', Path(__file__).with_name('kitchen-menu-cleanup.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
s = lambda value: {'stringValue': value}
def doc(path, data): return {'name': m.TARGET + '/documents/' + path, 'fields': data, 'updateTime': '2026-09-16T00:00:00Z'}
class MigrationTests(unittest.TestCase):
    def test_preserves_ordering_audit_and_unrelated_data(self):
        ordering = m.encode_map({'enabled': 'unchanged'})
        menu = doc('kitchens/k/menus/food', {'name': s('Food'), 'ordering': ordering, 'created': s('stamp'), 'system_kind': s('food'), 'id': s('food'), 'doc_url': s('')})
        plan = m.build_plan({'kitchens': [], 'places': [], 'menus': [menu]})
        after = plan['changes'][0]['after']
        self.assertEqual(after, {'name': s('Food'), 'ordering': ordering, 'created': s('stamp'), 'sort_order': {'integerValue': '0'}})
        self.assertEqual(m.build_plan({'kitchens': [], 'places': [], 'menus': [doc('kitchens/k/menus/food', after)]})['changes'], [])
    def test_currency_and_palette(self):
        kitchen = doc('kitchens/k', {'menus': m.encode_map({'context': 'old'})})
        place = doc('places/k', {'default_currency_code': s('CHF')})
        after = m.build_plan({'kitchens': [kitchen], 'places': [place], 'menus': []})['changes'][0]['after']
        self.assertEqual(after['currency'], s('CHF'))
        self.assertNotIn('menus', after)
        self.assertEqual(m.fields(m.fields(after['theme'])['palette'])['accent'], s('#0f766e'))
    def test_missing_currency_and_incomplete_doc_flagged(self):
        plan = m.build_plan({'kitchens': [doc('kitchens/k', {})], 'places': [], 'menus': [doc('kitchens/k/menus/m', {'doc_url': s('https://example.org/menu')})]})
        self.assertEqual(len(plan['issues']), 2)
        self.assertNotIn('currency', plan['changes'][0]['after'])
    def test_complete_doc_moved_and_existing_theme_preserved(self):
        data = {'doc_' + key: s(key) for key in m.DOC_KEYS}
        plan = m.build_plan({'kitchens': [], 'places': [], 'menus': [doc('kitchens/k/menus/m', data)]})
        self.assertEqual(plan['changes'][0]['after'], {'doc': m.encode_map({key:key for key in m.DOC_KEYS}), 'sort_order': {'integerValue': '0'}})
if __name__ == '__main__': unittest.main()
