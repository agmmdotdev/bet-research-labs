#!/usr/bin/env node
import fs from 'node:fs';

const EPS = 1e-9;
const pct = (x) => `${(x * 100).toFixed(2)}%`;
const pp = (x) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(2)}pp`;
const units = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(4)}`;

function assertNumber(value, label) {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function poisson(lambda, k) {
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

function resolveModel(model) {
  if (!model) throw new Error('Config requires a model object');

  const direct = typeof model.homeXG === 'number' && typeof model.awayXG === 'number';
  const base = direct ? model : model.base;
  if (!base) throw new Error('Model must provide either { homeXG, awayXG } or { base: { homeXG, awayXG } }');

  assertNumber(base.homeXG, 'model.base.homeXG');
  assertNumber(base.awayXG, 'model.base.awayXG');

  const bounds = model.bounds ?? {};
  const min = bounds.min ?? 0.05;
  const max = bounds.max ?? 6.0;
  let homeXG = clamp(base.homeXG, min, max);
  let awayXG = clamp(base.awayXG, min, max);
  const trace = [];

  for (const adj of model.adjustments ?? []) {
    const before = { homeXG, awayXG };
    homeXG += adj.homeDelta ?? 0;
    awayXG += adj.awayDelta ?? 0;
    if (typeof adj.homePct === 'number') homeXG *= 1 + adj.homePct;
    if (typeof adj.awayPct === 'number') awayXG *= 1 + adj.awayPct;
    if (typeof adj.homeMultiplier === 'number') homeXG *= adj.homeMultiplier;
    if (typeof adj.awayMultiplier === 'number') awayXG *= adj.awayMultiplier;
    homeXG = clamp(homeXG, min, max);
    awayXG = clamp(awayXG, min, max);
    trace.push({
      name: adj.name ?? 'unnamed adjustment',
      reason: adj.reason ?? '',
      before,
      applied: {
        homeDelta: adj.homeDelta ?? 0,
        awayDelta: adj.awayDelta ?? 0,
        homePct: adj.homePct ?? 0,
        awayPct: adj.awayPct ?? 0,
        homeMultiplier: adj.homeMultiplier ?? 1,
        awayMultiplier: adj.awayMultiplier ?? 1
      },
      after: { homeXG, awayXG }
    });
  }

  if (model.marketCalibration?.enabled) {
    const before = { homeXG, awayXG };
    const weight = model.marketCalibration.weight ?? 0.35;
    if (weight < 0 || weight > 1) throw new Error('model.marketCalibration.weight must be between 0 and 1');
    assertNumber(model.marketCalibration.marketHomeXG, 'model.marketCalibration.marketHomeXG');
    assertNumber(model.marketCalibration.marketAwayXG, 'model.marketCalibration.marketAwayXG');
    homeXG = clamp(
      homeXG * (1 - weight) + model.marketCalibration.marketHomeXG * weight,
      min,
      max
    );
    awayXG = clamp(
      awayXG * (1 - weight) + model.marketCalibration.marketAwayXG * weight,
      min,
      max
    );
    trace.push({
      name: model.marketCalibration.name ?? 'market calibration prior',
      reason: model.marketCalibration.reason ?? 'Blend manual xG with market-implied xG prior to reduce overconfidence.',
      before,
      applied: {
        marketHomeXG: model.marketCalibration.marketHomeXG,
        marketAwayXG: model.marketCalibration.marketAwayXG,
        weight
      },
      after: { homeXG, awayXG }
    });
  }

  return {
    homeXG,
    awayXG,
    maxGoals: model.maxGoals ?? 12,
    base: { homeXG: base.homeXG, awayXG: base.awayXG },
    trace
  };
}

function matrix(homeXG, awayXG, maxGoals = 12) {
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
  if (side === 'over') return value > line ? 1 : Math.abs(value - line) < EPS ? 0 : -1;
  if (side === 'under') return value < line ? 1 : Math.abs(value - line) < EPS ? 0 : -1;
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
      const goals = m.team === 'home' ? h : a;
      b = bucket(splitLine(m.line).map((line) => settleOU(goals, m.side, line)));
    } else if (m.type === 'asian_handicap') {
      const gf = m.team === 'home' ? h : a;
      const ga = m.team === 'home' ? a : h;
      b = bucket(splitLine(m.line).map((line) => {
        const margin = gf + line - ga;
        return margin > 0 ? 1 : Math.abs(margin) < EPS ? 0 : -1;
      }));
    } else if (m.type === 'result_and_total') {
      const r = h > a ? 'home' : a > h ? 'away' : 'draw';
      const resultWins = r === m.selection;
      const totalWins = settleOU(total, m.side, m.line) === 1;
      b = resultWins && totalWins ? 'fullWin' : 'fullLoss';
    } else if (m.type === 'win_and_btts') {
      const r = h > a ? 'home' : a > h ? 'away' : 'draw';
      const resultWins = r === m.selection;
      const bttsWins = h > 0 && a > 0;
      b = resultWins && bttsWins ? 'fullWin' : 'fullLoss';
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
  const winReturnFactor = settle.fullWin + settle.halfWin / 2;
  const lossFactor = settle.fullLoss + settle.halfLoss / 2;
  if (winReturnFactor <= EPS) return Infinity;
  return 1 + lossFactor / winReturnFactor;
}

function noVig(group) {
  const raw = group.outcomes.map((o) => ({ ...o, raw: 1 / o.odds }));
  const sum = raw.reduce((s, o) => s + o.raw, 0);
  return {
    ...group,
    overround: sum,
    margin: sum - 1,
    outcomes: raw.map((o) => ({ ...o, noVig: o.raw / sum }))
  };
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

function defaultMinEV(type) {
  if (type === '1x2') return 0.025;
  if (type === 'btts' || type === 'total' || type === 'asian_total') return 0.025;
  if (type === 'asian_handicap' || type === 'team_total') return 0.03;
  return 0.03;
}

function findBaseline(noVigGroups, baseline) {
  if (!baseline) return null;
  const group = noVigGroups.find((g) => g.name === baseline.group);
  if (!group) return null;
  return group.outcomes.find((o) => o.name === baseline.outcome) ?? null;
}

function analyze(cfg) {
  const resolved = resolveModel(cfg.model);
  const rows = matrix(resolved.homeXG, resolved.awayXG, resolved.maxGoals);
  const noVigGroups = (cfg.noVigGroups ?? []).map(noVig);
  const defaults = cfg.defaults ?? {};

  return {
    match: cfg.match,
    teams: { home: cfg.homeTeam, away: cfg.awayTeam },
    model: resolved,
    noVigGroups,
    summary: summarize(rows),
    topScores: [...rows]
      .sort((a, b) => b.p - a.p)
      .slice(0, cfg.topScores ?? 8)
      .map((r) => ({ score: `${r.h}-${r.a}`, p: r.p })),
    markets: (cfg.markets ?? []).map((m) => {
      assertNumber(m.odds, `${m.name}.odds`);
      const settlement = marketSettlement(rows, m);
      const value = ev(settlement, m.odds);
      const fair = fairOdds(settlement);
      const modelEquivalentProbability = Number.isFinite(fair) ? 1 / fair : 0;
      const rawImplied = 1 / m.odds;
      const baseline = findBaseline(noVigGroups, m.baseline);
      const noVigEdge = baseline ? modelEquivalentProbability - baseline.noVig : null;
      const rawEdge = modelEquivalentProbability - rawImplied;
      const minEV = m.minEVPerUnit ?? defaults.minEVPerUnit ?? defaultMinEV(m.type);
      const verdict = value >= minEV
        ? 'value candidate'
        : value > 0
          ? 'thin edge'
          : 'no value by model';

      return {
        name: m.name,
        odds: m.odds,
        rawImplied,
        baseline: baseline ? { name: baseline.name, noVig: baseline.noVig, noVigEdge } : null,
        settlement,
        profitProbability: settlement.fullWin + settlement.halfWin,
        notLosingProbability: settlement.fullWin + settlement.halfWin + settlement.push,
        modelFairOdds: fair,
        modelEquivalentProbability,
        rawEdge,
        evPerUnit: value,
        minEVPerUnit: minEV,
        verdict
      };
    })
  };
}

function print(result) {
  console.log(`\n${result.match}`);
  console.log(`${result.teams.home} adjusted xG ${result.model.homeXG.toFixed(3)} | ${result.teams.away} adjusted xG ${result.model.awayXG.toFixed(3)}`);
  console.log(`${result.teams.home} base xG ${result.model.base.homeXG.toFixed(3)} | ${result.teams.away} base xG ${result.model.base.awayXG.toFixed(3)}`);

  if (result.model.trace.length) {
    console.log('\nXG adjustment trace');
    for (const t of result.model.trace) {
      console.log(`- ${t.name}: ${t.before.homeXG.toFixed(3)}-${t.before.awayXG.toFixed(3)} -> ${t.after.homeXG.toFixed(3)}-${t.after.awayXG.toFixed(3)}`);
      if (t.reason) console.log(`  ${t.reason}`);
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
    const fair = Number.isFinite(m.modelFairOdds) ? m.modelFairOdds.toFixed(3) : 'Infinity';
    const baseline = m.baseline ? `, no-vig edge ${pp(m.baseline.noVigEdge)}` : '';
    console.log(`- ${m.name} @ ${m.odds}: raw ${pct(m.rawImplied)}, model fair ${fair}, raw edge ${pp(m.rawEdge)}${baseline}, EV ${units(m.evPerUnit)} => ${m.verdict}`);
    console.log(`  FW ${pct(st.fullWin)} | HW ${pct(st.halfWin)} | Push ${pct(st.push)} | HL ${pct(st.halfLoss)} | FL ${pct(st.fullLoss)}`);
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
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
