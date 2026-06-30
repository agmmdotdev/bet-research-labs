# Contextual Factors Checklist

The model must account for weather, player condition, travel, pitch, and match-day context. These factors should be applied as controlled xG or probability adjustments, not as emotional overrides.

## Principle

Context matters, but every adjustment needs:

1. a specific reason,
2. a direction,
3. an estimated size,
4. a note on which market it affects,
5. a post-match review.

Avoid vague logic like “rain means under” or “star player looks tired.” Convert it into a small, explicit assumption.

## Weather factors

| Factor | Typical effect | Possible model adjustment |
|---|---|---|
| Heavy rain | Slower passing, more slips, worse finishing, more mistakes | Reduce both xG slightly; sometimes increase set-piece/counter chaos |
| Strong wind | Hurts long passing, crossing, finishing, keeper control | Reduce open-play xG; increase set-piece variance |
| Extreme heat/humidity | Lower pressing intensity and second-half tempo | Reduce total xG; reduce high-press team edge |
| Cold/snow | Slower pitch and lower technical quality | Reduce tempo and shot quality |
| Indoor/roofed stadium | Weather effect reduced | Use normal model unless pitch condition is unusual |

## Player condition factors

| Factor | Typical effect | Possible model adjustment |
|---|---|---|
| Star attacker not starting | Lower team goal expectation, especially if scoring is concentrated | Reduce team xG or team total confidence |
| Star attacker minutes-limited | Lower late-game scoring expectation | Small xG reduction; avoid anytime scorer unless price compensates |
| Key creator missing | Lower chance quality and assist volume | Reduce team xG and BTTS/Over confidence |
| Key defender missing | Opponent xG increase; BTTS/Over stronger | Increase opponent xG |
| Defensive midfielder missing | More transition concessions | Increase opponent xG and BTTS probability |
| Goalkeeper injury/backup keeper | More finishing conversion risk | Increase opponent goal expectation slightly |
| Fatigue from extra time/travel | Lower intensity and defensive concentration | Can reduce attacking xG but increase late defensive mistakes |

## Match-day and tactical factors

| Factor | Typical effect | Markets affected |
|---|---|---|
| Team only needs draw | Lower risk-taking; double chance and unders improve | +0.5, double chance, Under |
| Favorite must chase goal difference | More attacking pressure | Team total Over, handicap, Over |
| Knockout 90-minute draw risk | Moneyline becomes less attractive | Asian totals, double chance, to qualify |
| Underdog can score but cannot defend | BTTS/Over cleaner than underdog handicap | BTTS Yes, Over |
| Compact underdog with weak attack | Handicap/Under cleaner than BTTS | +handicap, Under, BTTS No |
| Diaspora/home-like crowd | More energy, pressure, and late push | Double chance, handicap, cards/corners |

## Pitch and venue factors

| Factor | Typical effect | Possible adjustment |
|---|---|---|
| Poor pitch | Lower technical execution | Reduce total xG |
| Fast turf/artificial surface | Faster transitions, unfamiliar bounce | Increase variance; check team familiarity |
| Large travel gap | One team may fade late | Adjust second-half or late-goal assumptions |
| Altitude | Fatigue and tempo changes | Reduce pressing sustainability |
| Neutral venue with clear crowd lean | Not fully neutral | Add small contextual edge to supported team |

## Adjustment sizing guide

Use small adjustments unless evidence is strong.

| Evidence strength | Suggested xG adjustment |
|---|---:|
| Minor context note | 0.03 to 0.07 xG |
| Meaningful confirmed factor | 0.08 to 0.15 xG |
| Major lineup/tactical factor | 0.16 to 0.30 xG |
| Extreme weather or multiple major absences | 0.30+ xG, but require strong evidence |

## Example

If Sweden are missing a key center-back and France are expected to keep attacking:

```json
{
  "name": "Sweden defensive absence",
  "homeDelta": 0.15,
  "reason": "Confirmed key center-back absence weakens Sweden defensive baseline."
}
```

If extreme heat is expected to lower tempo:

```json
{
  "name": "Extreme heat tempo reduction",
  "homeDelta": -0.08,
  "awayDelta": -0.08,
  "reason": "Heat likely reduces pressing intensity and second-half tempo."
}
```

## Post-match review

After settlement, record whether the contextual adjustment mattered:

| Question | Purpose |
|---|---|
| Did weather visibly affect tempo or finishing? | Improve future adjustment size. |
| Did the lineup factor matter? | Validate player-condition assumptions. |
| Did crowd advantage show up in pressure or momentum? | Improve venue weighting. |
| Did the market already price the factor? | Avoid double-counting. |

The goal is not to add more factors blindly. The goal is to make each factor measurable and reviewable.
