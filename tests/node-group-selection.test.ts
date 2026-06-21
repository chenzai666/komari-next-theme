import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

const helperPath = path.resolve('src/utils/nodeGroupSelection.ts');
const helperSource = fs.readFileSync(helperPath, 'utf8');

function normalizeNodeSelectedGroup(
  selectedGroup: string | null | undefined,
  groups: readonly string[]
): string {
  if (!selectedGroup || selectedGroup === 'all' || selectedGroup === '_all_') {
    return 'all';
  }

  return groups.includes(selectedGroup) ? selectedGroup : 'all';
}

test('node group selection treats legacy _all_ as all nodes', () => {
  assert.equal(normalizeNodeSelectedGroup('_all_', []), 'all');
});

test('node group selection resets unknown groups to all nodes', () => {
  assert.equal(normalizeNodeSelectedGroup('missing-group', ['Tokyo', 'US']), 'all');
});

test('node group selection keeps valid groups unchanged', () => {
  assert.equal(normalizeNodeSelectedGroup('Tokyo', ['Tokyo', 'US']), 'Tokyo');
});

test('NodeDisplay helper exports the legacy all-group migration guard', () => {
  assert.match(helperSource, /LEGACY_ALL_NODES_GROUP\s*=\s*"_all_"/);
  assert.match(helperSource, /groups\.includes\(selectedGroup\)/);
});
