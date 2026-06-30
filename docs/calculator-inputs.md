# Football Value Calculator Inputs

The calculator is designed to make betting discussion more precise. It does not discover the truth by itself; it converts assumptions into explicit probabilities and expected value.

Run:

```bash
node scripts/football-value-calculator.mjs examples/france-sweden.json
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

### Adjusted format

```json
{
  "model": {
    "base": {
      "homeXG": 2.20,
      "awayXG": 0.95
    },
    "adjustments": [
      {
        "label": "Home attacking approach",
        "target": "home",
        "mode": "add",
        "value": 0.15
      },
      {
        "label": "Knockout caution",
        "target": "both",
        "mode": "multiply",
        "value": 0.96
      }
    ],
    "bounds": {
      "minXG": 0.05,
      "maxXG": 6.50
    },
    "maxGoals": 12
  }
}
```

## Adjustment fields

| Field | Allowed values | Meaning |
|---|---|---|
| `label` | text | Description shown in output. |
| `target` | `home`, `away`, `both` | Which xG value the adjustment changes. |
| `mode` | `add`, `multiply`, `percent` | How the value is applied. |
| `value` | number | Adjustment amount. |

Adjustment examples:

| Example | Meaning |
|---|---|
| `{ "mode": "add", "value": 0.15 }` | Adds 0.15 xG. |
| `{ "mode": "multiply", "value": 0.96 }` | Multiplies xG by 0.96. |
| `{ "mode": "percent", "value": -0.08 }` | Reduces xG by 8%. |

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

## Output interpretation

The calculator prints:

| Output | Meaning |
|---|---|
| `raw` | Raw implied probability from decimal odds. |
| `fair` | Model fair odds based on the settlement distribution. |
| `EV` | Expected profit/loss per 1 unit staked. |
| `value candidate` | EV is above the configured threshold, default 0.03 units. |
| `thin edge` | Positive EV, but below threshold. |
| `no value by model` | Negative EV under the current assumptions. |

## Important warning

Changing expected-goals inputs can change the verdict quickly. The calculator is only as good as the assumptions. Use it to make disagreement explicit, not to pretend football can be predicted with certainty.
