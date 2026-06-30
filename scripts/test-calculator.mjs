#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const output = execFileSync('node', [
  'scripts/football-value-calculator.mjs',
  'examples/france-sweden.json',
  '--json'
], { encoding: 'utf8' });

const result = JSON.parse(output);
assert.equal(result.match, 'France vs Sweden - structured pre-match model');
assert.ok(Math.abs(result.model.homeXG - 2.35) < 1e-9, 'adjusted home xG should be 2.35');
assert.ok(Math.abs(result.model.awayXG - 1.00) < 1e-9, 'adjusted away xG should be 1.00');
assert.ok(result.summary.bttsYes > 0.55, 'BTTS Yes probability should be above 55% in the example');

const btts = result.markets.find((m) => m.name === 'BTTS Yes');
assert.ok(btts, 'BTTS Yes market should exist');
assert.ok(btts.evPerUnit > 0, 'BTTS Yes should be positive EV under the example assumptions');
assert.equal(btts.verdict, 'thin edge');

const franceMl = result.markets.find((m) => m.name === 'France ML');
assert.ok(franceMl, 'France ML market should exist');
assert.ok(franceMl.evPerUnit < 0, 'France ML should be negative EV in the example assumptions');

console.log('calculator smoke test passed');
