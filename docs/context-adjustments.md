# Context Adjustments

Context factors should be accounted for, but they must be handled as explicit probability adjustments rather than vague narratives.

The practical rule:

> Context can move the model, but it should not replace the model.

## Adjustment hierarchy

Not every factor deserves the same weight.

| Tier | Factor | Typical importance |
|---|---|---|
| 1 | Confirmed lineup, goalkeeper, suspensions, minutes limits | High |
| 1 | Match incentive, qualification state, knockout format | High |
| 2 | Tactical matchup, pressing/counter profile, set pieces | Medium-high |
| 2 | Player physical condition, rest, travel, heat workload | Medium-high |
| 3 | Weather, pitch, venue, crowd split | Medium |
| 3 | Referee style, cards tendency, emotional rivalry | Market-specific |
| 4 | Public narratives, revenge stories, media quotes | Low unless tied to tactics or lineup |

## Player condition adjustments

Player condition matters more when it changes actual minutes, role, or physical output.

Useful checks:

- Is the player confirmed starting?
- Is the player returning from injury?
- Is the player likely limited to 45-70 minutes?
- Did the player play heavy minutes recently?
- Is there travel or heat fatigue?
- Is the replacement a major downgrade?
- Does the player affect finishing, chance creation, ball progression, or defensive structure?

Potential xG effects:

| Condition | Possible adjustment |
|---|---:|
| Elite attacker out | -0.15 to -0.40 team xG |
| Elite creator out | -0.10 to -0.30 team xG |
| Defensive leader / goalkeeper out | +0.10 to +0.35 opponent xG |
| Star starts but minutes-limited | Reduce the normal adjustment by 40-60% |
| Rotation but strong bench | Smaller downgrade than market panic may imply |

## Weather adjustments

Weather only matters when it changes how the game is played. Light rain is often over-discussed. Strong wind, heavy rain, extreme heat, and poor pitch conditions matter more.

| Weather / pitch factor | Possible effect |
|---|---|
| Strong wind | Hurts long balls, crosses, finishing, goalkeeper distribution; can lower total xG. |
| Heavy rain / bad pitch | Hurts passing precision but can create defensive mistakes. Direction depends on teams. |
| Extreme heat / humidity | Lowers pressing intensity and second-half tempo. Can favor unders unless one team collapses physically. |
| Cold weather | Usually minor unless extreme or unfamiliar. |
| Artificial turf / poor grass | Can affect technical teams and injury risk. |

Suggested use:

- Mild weather: no adjustment.
- Moderate weather: 0.03 to 0.10 xG shift.
- Severe weather: 0.10 to 0.25 xG shift or stronger if both teams rely on affected tactics.

## Venue and crowd adjustments

A neutral venue is not always neutral. Diaspora support can create a home-like atmosphere.

This can affect:

- pressing energy,
- referee pressure,
- momentum after chances,
- player confidence,
- late-match emotional lift.

Suggested use:

| Venue situation | Possible adjustment |
|---|---:|
| True neutral | 0.00 xG |
| Moderate crowd lean | +0.03 to +0.08 xG or small double-chance confidence boost |
| Strong diaspora/home-like edge | +0.08 to +0.15 xG or stronger handicap confidence |
| Host nation home match | Treat closer to home advantage, but still check price |

## Tactical matchup adjustments

This is often more important than raw form.

| Matchup | Market implication |
|---|---|
| Underdog can score but cannot defend | BTTS / Over can be better than underdog handicap. |
| Favorite controls but opponent is compact | Win + Under or modest handicap can be better than large handicap. |
| Team only needs draw | Double chance / +0.5 often improves. |
| High press vs weak buildup | Favorite team total and opponent turnovers matter. |
| Strong set-piece team vs weak aerial defense | Team total, BTTS, player shots/headers may improve. |

## Referee adjustments

Referee profile should be used mainly for cards, penalties, and match control markets.

| Referee tendency | Potential market impact |
|---|---|
| High cards | Cards overs, aggressive-team card props. |
| Lets contact go | Benefits physical teams; can reduce stop-start rhythm. |
| Penalty-heavy | Slight boost to goals and penalty-taker props. |
| Strict early cards | Can weaken pressing and defensive aggression. |

## How to apply adjustments in the calculator

Every adjustment should be written in the JSON config, not kept in memory.

Example:

```json
{
  "name": "Extreme heat reduces tempo",
  "homeDelta": -0.08,
  "awayDelta": -0.08,
  "reason": "High heat likely lowers pressing and second-half pace."
}
```

Example:

```json
{
  "name": "Defensive leader suspended",
  "homeDelta": 0.15,
  "reason": "Opponent missing central defensive organizer."
}
```

## Guardrails

1. Do not stack too many small subjective boosts until every bet looks positive.
2. If a factor is already heavily priced by the market, reduce the adjustment.
3. If the factor affects both teams equally, avoid one-sided adjustment.
4. Always ask: does this factor change goals, result probability, or only narrative confidence?
5. Record the adjustment reason so post-match review can audit whether it mattered.
