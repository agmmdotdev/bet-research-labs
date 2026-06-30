# Context Adjustment Guide

This guide turns qualitative match context into explicit xG and market-selection adjustments. The goal is not to invent certainty; it is to make assumptions visible, testable, and reviewable.

## Core principle

Context factors should be used in two ways:

1. **xG adjustment** — change expected goals up or down.
2. **market-selection adjustment** — change which market is preferred even if xG barely moves.

Example:

- Heavy rain may lower both teams' open-play xG.
- A weak referee may not change xG directly, but can increase card/penalty volatility.
- A key striker starting at 60% fitness may reduce team total confidence but not necessarily kill double chance.

## Factor categories

| Category | What to check | Typical effect |
|---|---|---|
| Weather | Rain, wind, heat, humidity, snow, pitch wetness | Affects tempo, finishing, crossing, set pieces, fatigue. |
| Pitch/stadium | Grass quality, turf, stadium size, altitude, roof | Affects ball speed, pressing, player comfort. |
| Player condition | Injuries, minutes limit, fatigue, illness, match fitness | Affects xG, pressing, defensive recovery, substitutions. |
| Lineup | Confirmed XI, tactical shape, rotated players | Directly affects attacking/defensive strength. |
| Rest/travel | Days since last match, travel distance, time zone | Affects energy, pressing, late-game collapse risk. |
| Motivation/incentive | Must-win, draw enough, already qualified, goal difference | Affects tempo and risk-taking. |
| Venue/fan split | Home crowd, diaspora crowd, hostile venue | Affects intensity, confidence, referee pressure, momentum. |
| Referee | Cards, penalties, fouls allowed, stoppage style | Affects cards, set pieces, penalties, game flow. |
| Tactical matchup | Low block, high press, transition threat, set pieces | Determines which markets fit the expected script. |
| Market movement | Opening odds vs current odds vs closing odds | Helps detect whether information is already priced. |

## Suggested xG adjustment ranges

These ranges are intentionally conservative. Large manual changes should require strong evidence.

| Factor | Typical xG adjustment |
|---|---:|
| Minor attacking absence | -0.05 to -0.15 team xG |
| Major creative/finishing absence | -0.15 to -0.35 team xG |
| Star scorer benched but strong replacement | -0.10 to -0.25 team xG |
| Star scorer benched and weak replacement | -0.25 to -0.50 team xG |
| Key defender absent | +0.10 to +0.30 opponent xG |
| Multiple defensive absences | +0.25 to +0.60 opponent xG |
| Heavy rotation | -0.10 to -0.40 team xG, +0.05 to +0.25 opponent xG |
| Must-win chasing state | +0.05 to +0.25 team xG, +0.05 to +0.20 opponent xG |
| Team only needs draw | -0.05 to -0.25 team xG |
| Strong diaspora/home-like crowd | +0.03 to +0.12 team xG or confidence upgrade |
| Extreme heat/humidity | -0.05 to -0.20 both teams, especially high-press teams |
| Strong wind/heavy rain | -0.05 to -0.25 finishing/crossing xG, possible set-piece boost |
| Poor pitch | -0.05 to -0.20 technical team xG, possible chaos boost to underdog |

## Weather guidance

Weather does not always mean Under. The effect depends on type.

| Weather condition | Likely effect | Market caution |
|---|---|---|
| Light rain | Ball moves faster; can help attacks | Do not automatically downgrade goals. |
| Heavy rain | Worse control and finishing; defensive mistakes possible | Can hurt overs and increase chaos. |
| Strong wind | Hurts long balls, crosses, shots, goalkeeper handling | Be careful with overs and shot props. |
| Extreme heat | Slower tempo, less pressing, more fatigue | Favors unders or late-goal volatility depending substitutions. |
| High humidity | Similar to heat; fatigue accumulates | Watch second-half drop-off. |
| Snow/cold | Finishing and footing issues | Usually reduce technical attacking confidence. |

## Player-condition guidance

Do not treat a player as binary available/unavailable. Condition matters.

| Condition | Adjustment idea |
|---|---|
| Starts but not 90-minute fit | Lower team total confidence; prefer early props only if role is clear. |
| Returning from injury | Reduce pressing and explosive-action assumptions. |
| Key player benched | Reduce first-half xG more than full-match xG if likely to enter later. |
| Star on bench but strong depth | Smaller downgrade; avoid player-specific props. |
| Defensive leader absent | Increase opponent xG and BTTS probability. |
| Goalkeeper backup starts | Increase opponent finishing conversion slightly; consider team total or BTTS. |

## Market-selection examples

| Context | Better market | Avoid |
|---|---|---|
| Favorite strong but rotated | Win + Under, modest Asian handicap, team total only at better price | Big handicap at short odds |
| Underdog can score but defends badly | BTTS Yes, Over, underdog team total | Underdog handicap unless price is strong |
| Underdog organized but limited attack | Underdog handicap, Under, BTTS No | BTTS Yes at short odds |
| Favorite likely wins but draw risk exists in knockout | Asian total, team total, to qualify if price allows | Short 90-minute ML |
| Team only needs draw | Double chance / +0.5 | Forcing ML |
| Hot weather and two cautious teams | Under / Asian Under | Over based only on team reputation |

## Calculator usage

The calculator supports manual context adjustments inside the JSON model.

Example:

```json
{
  "model": {
    "base": {
      "homeXG": 2.15,
      "awayXG": 0.95
    },
    "adjustments": [
      {
        "name": "Key away defender absent",
        "homeDelta": 0.18,
        "reason": "Opponent missing starting center-back."
      },
      {
        "name": "Extreme heat",
        "homeDelta": -0.08,
        "awayDelta": -0.08,
        "reason": "Likely lower pressing tempo."
      }
    ]
  }
}
```

## Review rule

Every adjustment should be reviewable after the match.

Ask:

1. Did the factor actually appear in the match?
2. Was the adjustment direction correct?
3. Was the adjustment size too big or too small?
4. Did the market already price it in?
5. Did it change the correct market type?

## Warning

Context adjustments are where overconfidence enters most easily. Keep adjustments small unless the evidence is strong, and record the reason clearly.
