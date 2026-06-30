# Context Factors Checklist

This is the canonical checklist for weather, player condition, travel, pitch, venue, referee, tactical, and market-movement adjustments in Bet Research Labs.

Context factors should be included in betting research, but only through controlled adjustments. The goal is to avoid emotional overreaction while still accounting for match realities that a base model may miss.

## Principle

Context factors should answer two questions:

1. Does this factor change expected goals, result probability, cards/corners, or player props?
2. Is the factor already priced into the market?

If the factor is obvious and widely reported, assume the market has partially or fully priced it. If the factor is subtle, late, or misinterpreted, it may create edge.

## Factor categories

| Category | Examples | Likely model impact |
|---|---|---|
| Lineups | Confirmed XI, formation, striker starts, backup keeper | Direct xG and win-probability adjustment |
| Player condition | Fatigue, minor knock, illness, minutes restriction, return from injury | Reduce player/team xG, shots, pressing, defensive reliability |
| Injuries/suspensions | Missing center-back, missing creator, suspended fullback | Team xG, opponent xG, BTTS, handicap |
| Rotation | Favorite rests starters, dead-rubber group match | Reduce attacking/defensive certainty |
| Weather | Heavy rain, wind, extreme heat, humidity, cold | Tempo, shot quality, total goals, fatigue |
| Pitch/stadium | Artificial turf, poor surface, narrow pitch, altitude | Passing quality, pressing, set pieces, pace |
| Rest/travel | Short rest, long travel, time-zone shift | Late-game drop-off, pressing, injury risk |
| Motivation/incentive | Needs draw, must win, goal difference, already qualified | Market selection: DC, AH, totals, late-game risk |
| Venue/crowd | Diaspora support, home-like neutral venue, hostile crowd | Intensity, momentum, referee pressure, cards/corners |
| Referee | Cards profile, penalty tendency, foul threshold | Cards, penalties, set pieces, game rhythm |
| Tactical matchup | Low block, high press, transition threat, set-piece edge | Score distribution and market fit |
| Market movement | Steam, drift, closing-line movement | Signal that new information may be priced in |

## Translating factors into xG adjustments

Use small adjustments by default. Large adjustments need a strong reason.

| Adjustment size | Interpretation |
|---:|---|
| ±0.03 to ±0.07 xG | Small tactical/weather/player-condition lean |
| ±0.08 to ±0.15 xG | Meaningful lineup, stylistic, or matchup factor |
| ±0.16 to ±0.30 xG | Major absence, rotation, goalkeeper issue, severe weather |
| 0.30+ xG | Rare; requires strong evidence and should be challenged |

## Examples

### Sweden scoring profile vs France

If Sweden have consistently scored and France play aggressively:

```json
{
  "name": "Sweden transition and set-piece threat",
  "awayDelta": 0.10,
  "reason": "Sweden have live counter/set-piece routes and France's approach leaves transition space."
}
```

### Defensive absence

If Sweden miss a starting center-back:

```json
{
  "name": "Sweden defensive absence",
  "homeDelta": 0.15,
  "reason": "Missing center-back weakens defensive baseline and aerial coverage."
}
```

### Knockout caution

If a knockout match may slow down:

```json
{
  "name": "Knockout caution",
  "homeDelta": -0.05,
  "awayDelta": -0.05,
  "reason": "Elimination risk may reduce tempo if the game is level or the favorite leads."
}
```

### Extreme weather

If conditions are hot and humid:

```json
{
  "name": "Heat and humidity tempo reduction",
  "homePct": -0.04,
  "awayPct": -0.04,
  "reason": "High heat can reduce pressing intensity and late-game tempo."
}
```

If there is heavy wind:

```json
{
  "name": "Wind reduces shot and crossing quality",
  "homeDelta": -0.08,
  "awayDelta": -0.08,
  "reason": "Strong wind can lower shot accuracy, crossing quality, and long-ball control."
}
```

## Market-specific impact

| Factor | Markets affected most |
|---|---|
| Star striker not starting | Team total, anytime scorer, handicap, BTTS |
| Defensive leader missing | BTTS, opponent team total, favorite handicap |
| Heavy rain/wind | Unders, shots on target unders, set-piece variance |
| Extreme heat | Second-half tempo, unders, late goals if fatigue is one-sided |
| Team only needs draw | Double chance, +0.5, unders, avoid short ML |
| Big diaspora crowd | Double chance, handicap, cards/corners, momentum markets |
| Weak referee foul threshold | Cards overs, free-kick/set-piece threat |

## Guardrails

1. Do not double-count a factor already priced by the market.
2. Do not adjust xG heavily for vague narratives.
3. Prefer late confirmed information over predicted lineups.
4. Record the reason for every adjustment.
5. Compare the adjusted model against market-implied probabilities.
6. Review after the match whether the factor actually mattered.

## Current rule

Context factors are mandatory inputs, but they should be expressed as explicit adjustments in the calculator or written analysis. If we cannot explain how a factor changes probability, it should not change the bet.
