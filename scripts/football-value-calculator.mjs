#!/usr/bin/env node
import fs from 'node:fs';

const EPS = 1e-9;
const pct = (x) => `${(x * 100).toFixed(2)}%`;
const units = (x) => `${x > 0 ? '+' : ''}${x.toFixed(4)}`;
const decimals = (x) => Number.isFinite(x) ? x.toFixed(3) : 'n/a';

function assertNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

function clamp(value, min = 0.05, max = 6.5) {
  return Math.min(max, Math.max(min, value));
}

function poisson(lambda, k) {
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

function matrix(homeXG, awayXG, maxGoals = 12) {
  assertNumber(homeXG, 'homeXG');
  assertNumber(awayXG, 'awayXG');
  const rows = [];
  let mass = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poisson(homeXG, h) * poisson(awayXG, a);
      rows.push({ h, a, p });
      mass += p;
    }
  }
  return rows.map((r) => ({ ...r, p: r.p / mass }));
}

function splitLine(line) {
  const twice = line * 2;
  if (Math.abs(twice - Math.round(twice)) < EPS) return [line];
  const low = Math.floor(twice) / 2;
  return [low, low + 0.5];
}

function settleOU(value, side, line) {
  if (side === 'over') return value > line ? 1 : value === line ? 0 : -1;
  if (side === 'under') return value < line ? 1 : value === line ? 0 : -1;
  throw new Error(`Invalid over/under side: ${side}`);
}

function bucket(parts) {
  const avg = parts.reduce((s, x) => s + x, 0) / parts.length;
  if (Math.abs(avg - 1) < EPS) return 'fullWin';
  if (Math.abs(avg - 0.5) < EPS) return 'halfWin';
  if (Math.abs(avg) < EPS) return 'push';
  if (Math.abs(avg + 0.5) < EPS) return 'halfLoss';
  if (Math.abs(avg + 1) < EPS) return 'fullLoss';
  throw new Error(`Unexpected settlement bucket: ${avg}`);
}

function empty() {
  return { fullWin: 0, halfWin: 0, push: 0, halfLoss: 0, fullLoss: 0 };
}

function normalizeTeam(value, fieldName = 'team') {
  const team = String(value ?? '').toLowerCase();
  if (team === 'home' || team === 'away') return team;
  throw new Error(`${fieldName} must be "home" or "away"`);
}

function normalizeTarget(value) {
  const target = String(value ?? '').toLowerCase();
  if (target === 'home' || target === 'away' || target === 'both') return target;
  throw new Error('adjustment target must be "home", "away", or "both"');
}

function applyAdjustmentValue(current, adj) {
  const mode = String(adj.mode ?? 'add').toLowerCase();
  assertNumber(adj.value, `adjustment "${adj.label ?? 'unlabeled'}" value`);
  if (mode === 'add') return current + adj.value;
  if (mode === 'multiply' || mode === 'multiplier') return current * adj.value;
  if (mode === 'percent') return current * (1 + adj.value);
  throw new Error(`Unsupported adjustment mode: ${adj.mode}`);
}

function resolveModel(model = {}) {
  const baseHome = model.homeXG ?? model.base?.homeXG;
  const baseAway = model.awayXG ?? model.base?.awayXG;
  assertNumber(baseHome, 'model.homeXG or model.base.homeXG');
  assertNumber(baseAway, 'model.awayXG or model.base.awayXG');

  const bounds = model.bounds ?? {};
  const minXG = bounds.minXG ?? 0.05;
  const maxXG = bounds.maxXG ?? 6.5;
  let homeXG = baseHome;
  let awayXG = baseAway;
  const trace = [{ label: 'base', homeXG, awayXG, note: 'starting expected goals' }];

  for (const adj of model.adjustments ?? []) {
    const target = normalizeTarget(adj.target);
    if (target === 'home' || target === 'both') homeXG = applyAdjustmentValue(homeXG, adj);
    if (target === 'away' || target === 'both') awayXG = applyAdjustmentValue(awayXG, adj);
    homeXG = clamp(homeXG, minXG, maxXG);
    awayXG = clamp(awayXG, minXG, maxXG);
    trace.push({
      label: adj.label ?? 'adjustment',
      target,
      mode: adj.mode ?? 'add',
      value: adj.value,
      homeXG,
      awayXG,
      note: adj.note ?? null
    });
  }

  return {
    ...model,
    base: { homeXG: baseHome, awayXG: baseAway },
    homeXG,
    awayXG,
    trace,
    maxGoals: model.maxGoals ?? 12
  };
}

function marketSettlement(rows, m) {
  const out = empty();
  for (const { h, a, p } of rows) {
    const total = h + a;
    let b;

    if (m.type === '1x2') {
      const r = h > a ? 'home' : a > h ? 'away' : 'draw';
      b = r === m.selection ? 'fullWin' : 'fullLoss';
    } else if (m.type === 'double_chance') {
      const r = h > a ? 'home' : a > h ? 'away' : 'draw';
      const s = String(m.selection).toLowerCase();
      const win = (s === '1x' && (r === 'home' || r === 'draw')) ||
        (s === 'x2' && (r === 'away' || r === 'draw')) ||
        (s === '12' && (r === 'home' || r === 'away'));
      b = win ? 'fullWin' : 'fullLoss';
    } else if (m.type === 'btts') {
      b = ((h > 0 && a > 0) === (m.selection === 'yes')) ? 'fullWin' : 'fullLoss';
    } else if (m.type === 'total' || m.type === 'asian_total') {
      b = bucket(splitLine(m.line).map((line) => settleOU(total, m.side, line)));
    } else if (m.type === 'team_total') {
      const goals = normalizeTeam(m.team) === 'home' ? h : a;
      b = bucket(splitLine(m.line).map((line) => settleOU(goals, m.side, line)));
    } else if (m.type === 'asian_handicap') {
      const team = normalizeTeam(m.team);
      const gf = team === 'home' ? h : a;
      const ga = team === 'home' ? a : h;
      b = bucket(splitLine(m.line).map((line) => {
        const margin = gf + line - ga;
        return margin > 0 ? 1 : Math.abs(margin) < EPS ? 0 : -1;
      }));
    } else {
      throw new Error(`Unsupported market type: ${m.type}`);
    }

    out[b] += p;
  }
  return out;
}

function ev(settle, odds) {
  return settle.fullWin * (odds - 1) +
    settle.halfWin * ((odds - 1) / 2) -
    settle.halfLoss * 0.5 -
    settle.fullLoss;
}

function fairOdds(settle) {
  const winWeight = settle.fullWin + 0.5 * settle.halfWin;
  const lossWeight = settle.fullLoss + 0.5 * settle.halfLoss;
  if (winWeight <= EPS) return Infinity;
  return (winWeight + lossWeight) / winWeight;
}

function noVig(group) {
  const raw = group.outcomes.map((o) => ({ ...o, raw: 1 / o.odds }));
  const sum = raw.reduce((s, o) => s + o.raw, 0);
  return { ...group, overround: sum, margin: sum - 1, outcomes: raw.map((o) => ({ ...o, noVig: o.raw / sum })) };
}

function summarize(rows) {
  const s = { homeWin: 0, draw: 0, awayWin: 0, over25: 0, under25: 0, over35: 0, under35: 0, bttsYes: 0, bttsNo: 0 };
  for (const { h, a, p } of rows) {
    if (h > a) s.homeWin += p; else if (a > h) s.awayWin += p; else s.draw += p;
    if (h + a > 2.5) s.over25 += p; else s.under25 += p;
    if (h + a > 3.5) s.over35 += p; else s.under35 += p;
    if (h > 0 && a > 0) s.bttsYes += p; else s.bttsNo += p;
  }
  return s;
}

function verdict(value, threshold = 0.03) {
  if (value >= threshold) return 'value candidate';
  if (value > 0) return 'thin edge';
  return 'no value by model';
}

function analyze(cfg) {
  const model = resolveModel(cfg.model);
  const rows = matrix(model.homeXG, model.awayXG, model.maxGoals);
  const evThreshold = cfg.evThreshold ?? 0.03;
  return {
    match: cfg.match,
    teams: { home: cfg.homeTeam, away: cfg.awayTeam },
    model,
    noVigGroups: (cfg.noVigGroups ?? []).map(noVig),
    summary: summarize(rows),
    topScores: [...rows].sort((a, b) => b.p - a.p).slice(0, cfg.topScores ?? 8).map((r) => ({ score: `${r.h}-${r.a}`, p: r.p })),
    markets: (cfg.markets ?? []).map((m) => {
      const settlement = marketSettlement(rows, m);
      const value = ev(settlement, m.odds);
      const fair = fairOdds(settlement);
      return {
        name: m.name,
        odds: m.odds,
        rawImplied: 1 / m.odds,
        fairOdds: fair,
        oddsEdge: Number.isFinite(fair) ? m.odds - fair : null,
        settlement,
        profitProbability: settlement.fullWin + settlement.halfWin,
        notLosingProbability: settlement.fullWin + settlement.halfWin + settlement.push,
        evPerUnit: value,
        verdict: verdict(value, evThreshold)
      };
    })
  };
}

function print(result) {
  console.log(`\n${result.match}`);
  console.log(`${result.teams.home} final xG ${decimals(result.model.homeXG)} | ${result.teams.away} final xG ${decimals(result.model.awayXG)}`);
  console.log(`${result.teams.home} base xG ${decimals(result.model.base.homeXG)} | ${result.teams.away} base xG ${decimals(result.model.base.awayXG)}`);

  if (result.model.trace?.length > 1) {
    console.log('\nModel adjustments');
    for (const step of result.model.trace.slice(1)) {
      const val = step.mode === 'percent' ? pct(step.value) : step.value;
      console.log(`- ${step.label}: target ${step.target}, ${step.mode} ${val} => home ${decimals(step.homeXG)}, away ${decimals(step.awayXG)}`);
    }
  }

  if (result.noVigGroups.length) {
    console.log('\nNo-vig baselines');
    for (const g of result.noVigGroups) {
      console.log(`- ${g.name}: overround ${pct(g.overround)}, margin ${pct(g.margin)}`);
      for (const o of g.outcomes) console.log(`  ${o.name}: raw ${pct(o.raw)}, no-vig ${pct(o.noVig)}`);
    }
  }

  const s = result.summary;
  console.log('\nModel summary');
  console.log(`1X2: home ${pct(s.homeWin)}, draw ${pct(s.draw)}, away ${pct(s.awayWin)}`);
  console.log(`Totals: over2.5 ${pct(s.over25)}, over3.5 ${pct(s.over35)}, BTTS Yes ${pct(s.bttsYes)}`);

  console.log('\nTop scores');
  for (const t of result.topScores) console.log(`- ${t.score}: ${pct(t.p)}`);

  console.log('\nMarkets');
  for (const m of result.markets) {
    const st = m.settlement;
    console.log(`- ${m.name} @ ${m.odds}: raw ${pct(m.rawImplied)}, fair ${decimals(m.fairOdds)}, EV ${units(m.evPerUnit)} => ${m.verdict}`);
    console.log(`  Profit ${pct(m.profitProbability)} | Not losing ${pct(m.notLosingProbability)} | FW ${pct(st.fullWin)} | HW ${pct(st.halfWin)} | Push ${pct(st.push)} | HL ${pct(st.halfLoss)} | FL ${pct(st.fullLoss)}`);
  }
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/football-value-calculator.mjs <config.json> [--json]');
  process.exit(1);
}

try {
  const result = analyze(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else print(result);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
