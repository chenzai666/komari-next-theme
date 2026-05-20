import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

const filePath = path.resolve('src/components/WelcomeVisitorCard.tsx');
const source = fs.readFileSync(filePath, 'utf8');

test('WelcomeVisitorCard should not compute date text during initial render', () => {
  assert.doesNotMatch(
    source,
    /useState\(formatVisitorDate\(\)\)/,
    'initial render should not call formatVisitorDate() directly because it can cause hydration mismatch'
  );
});

test('WelcomeVisitorCard should not parse navigator userAgent during initial render', () => {
  assert.doesNotMatch(
    source,
    /useMemo\(\(\) => UserAgentHelper\.parse\(\), \[\]\)/,
    'initial render should not parse navigator.userAgent directly because it can differ across environments'
  );
});

test('WelcomeVisitorCard should expose a stable initial loading placeholder', () => {
  assert.match(
    source,
    /正在识别你的来访信息\.\.\./,
    'component should keep a stable loading placeholder while client-only data is being resolved'
  );
});

test('WelcomeVisitorCard should not call ipwho.is directly anymore', () => {
  assert.doesNotMatch(
    source,
    /https:\/\/ipwho\.is\//,
    'ipwho.is returns intermittent 403s and should not remain in the visitor geo fetch strategy list'
  );
});
