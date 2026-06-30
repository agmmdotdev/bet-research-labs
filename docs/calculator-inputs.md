# Football Value Calculator Inputs

The calculator is designed to make betting discussion more precise. It does not discover the truth by itself; it converts assumptions into explicit probabilities, no-vig comparisons, fair odds, and expected value.

Run:

```bash
node scripts/football-value-calculator.mjs examples/france-sweden.json
```

JSON output:

```bash
node scripts/football-value-calculator.mjs examples/france-sweden.json --json
```

## Required top-level fields

```json
{
  "match": "France vs Sweden",
  "homeTeam": "France",
  "awayTeam": "Sweden",
  "model": {},
  "markets": []
}
```

## Optional defaults

```json
{
  "defaults": {
    "minEVPerUnit": 0.025
  }
}
```

`minEVPerUnit` is the minimum expected profit per 1 unit staked required before the script labels a market as a `value candidate`.

## Model input

The model supports two formats.

### Simple format

```json
{
  "model": {
    "homeXG": 2.35,
    "awayXG": 1.05,
    "maxGoals": 12
  }
}
```

### Structured adjusted format

```json
{
  "model": {
    "base": {
      "homeXG": 2.15,
      "awayXG": 0.95
    },
    "adjustments": [
      {
        "name": "Home attacking posture",
        "homeDelta": 0.10,
        "reason": "Home side expected to keep attacking."
      },
      {
        "name": "Away scoring profile",
        "awayDelta": 0.10,
        "reason": "Away side has scored consistently."
      },
      {
        "name": "Knockout caution",
        "homeDelta": -0.05,
        "awayDelta": -0.05,
        "reason": "Knockout state may reduce tempo."
      }
    ],
    "bounds": {
      "min": 0.05,
      "max": 6.00
    },
    "maxGoals": 12
  }
}
```

## Adjustment fields

| Field | Meaning |
|---|---|
| `name` | Human-readable adjustment label. |
| `reason` | Why the adjustment exists. Printed in the trace. |
| `homeDelta` | Add/subtract absolute xG from the home team. |
| `awayDelta` | Add/subtract absolute xG from the away team. |
| `homePct` | Percentage adjustment to home xG. `0.10` means +10%. |
| `awayPct` | Percentage adjustment to away xG. `-0.08` means -8%. |
| `homeMultiplier` | Direct multiplier for home xG. `0.96` means multiply by 0.96. |
| `awayMultiplier` | Direct multiplier for away xG. |

Adjustment examples:

| Example | Meaning |
|---|---|
| `{ "homeDelta": 0.15 }` | Adds 0.15 xG to the home team. |
| `{ "awayDelta": -0.10 }` | Removes 0.10 xG from the away team. |
| `{ "homePct": 0.08 }` | Increases home xG by 8%. |
| `{ "awayMultiplier": 0.92 }` | Multiplies away xG by 0.92. |

## Optional market calibration prior

Use this when you want to blend the manual model back toward a market-implied goal expectation.

```json
{
  "model": {
    "marketCalibration": {
      "enabled": true,
      "marketHomeXG": 2.25,
      "marketAwayXG": 1.05,
      "weight": 0.35,
      "reason": "Blend manual xG with market prior to reduce overconfidence."
    }
  }
}
```

A weight of `0.35` means final xG is 65% manual model and 35% market prior.

## No-vig groups

Use `noVigGroups` to see bookmaker margin and no-vig implied probabilities.

```json
{
  "noVigGroups": [
    {
      "name": "1X2 example odds",
      "outcomes": [
        { "name": "Home", "odds": 1.80 },
        { "name": "Draw", "odds": 3.60 },
        { "name": "Away", "odds": 4.80 }
      ]
    }
  ]
}
```

Markets can reference a no-vig outcome using `baseline`:

```json
{
  "name": "Home ML",
  "type": "1x2",
  "selection": "home",
  "odds": 1.80,
  "baseline": { "group": "1X2 example odds", "outcome": "Home" }
}
```

## Supported market types

### 1X2

```json
{
  "name": "France ML",
  "type": "1x2",
  "selection": "home",
  "odds": 1.80
}
```

`selection` can be `home`, `draw`, or `away`.

### Double chance

```json
{
  "name": "Colombia X2",
  "type": "double_chance",
  "selection": "x2",
  "odds": 1.84
}
```

`selection` can be `1x`, `x2`, or `12`.

### BTTS

```json
{
  "name": "BTTS Yes",
  "type": "btts",
  "selection": "yes",
  "odds": 1.77
}
```

### Total / Asian total

```json
{
  "name": "Over 2.25 goals",
  "type": "asian_total",
  "side": "over",
  "line": 2.25,
  "odds": 1.80
}
```

`side` can be `over` or `under`.

### Team total

```json
{
  "name": "Argentina team total Over 2.5",
  "type": "team_total",
  "team": "home",
  "side": "over",
  "line": 2.5,
  "odds": 1.90
}
```

### Asian handicap

```json
{
  "name": "Norway -0.75",
  "type": "asian_handicap",
  "team": "away",
  "line": -0.75,
  "odds": 1.86
}
```

### Result and total

```json
{
  "name": "Germany win + Under 3.5",
  "type": "result_and_total",
  "selection": "home",
  "side": "under",
  "line": 3.5,
  "odds": 1.75
}
```

### Win and BTTS

```json
{
  "name": "France win + BTTS Yes",
  "type": "win_and_btts",
  "selection": "home",
  "odds": 2.45
}
```

## Output interpretation

The calculator prints:

| Output | Meaning |
|---|---|
| `raw` | Raw implied probability from decimal odds. |
| `model fair` | Fair odds from the model's settlement distribution. |
| `raw edge` | Model-equivalent probability minus raw implied probability. |
| `no-vig edge` | Model-equivalent probability minus selected no-vig baseline probability. |
| `EV` | Expected profit/loss per 1 unit staked. |
| `value candidate` | EV is above the configured threshold. |
| `thin edge` | Positive EV, but below threshold. |
| `no value by model` | Negative EV under the current assumptions. |

## Important warning

Changing expected-goals inputs can change the verdict quickly. The calculator is only as good as the assumptions. Use it to make disagreement explicit, not to pretend football can be predicted with certainty.
