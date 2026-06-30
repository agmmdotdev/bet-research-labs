# Betting Research Framework

This framework is used to decide whether a market is worth taking at the available price. It is intentionally process-first: the aim is to make better decisions over a long sample, not to judge a single pick only by whether it won.

## 1. Define the match state

Before looking at odds, classify the match:

| Question | Why it matters |
|---|---|
| Is it group stage or knockout? | Knockout matches have extra-time/draw risk in 90-minute markets. |
| Does either team only need a draw? | This can favor double chance, +0.5, and unders. |
| Is either team already qualified or eliminated? | Rotation and intensity can change the correct market. |
| Does goal difference matter? | A favorite may keep pushing instead of protecting a lead. |
| Is the venue truly neutral? | Diaspora crowd advantage can influence intensity, pressure, and match rhythm. |

## 2. Check lineup and scoring concentration

A team brand is not enough. The actual lineup decides the market.

Key checks:

- Confirmed starters and major absences.
- Star scorer dependency.
- Rotation level.
- Bench scoring quality.
- Suspensions and minutes limitations.
- Whether the selected player prop is voided or settled as a loss if the player does not start.

Example lesson: if a team has scored all recent goals through one player and that player is benched, reduce confidence in team total overs or demand a better price.

## 3. Account for contextual factors

Contextual factors should be included when they materially change expected goals, tempo, lineup quality, or card/set-piece risk. They should not be used as decoration after a pick is already chosen.

| Factor | What to check | Typical betting impact |
|---|---|---|
| Weather | Rain, wind, heat, humidity, storms, air quality | Can lower finishing quality, increase mistakes, reduce tempo, or favor unders. Strong wind matters more than light rain. |
| Pitch and stadium | Grass/turf, pitch size, surface speed, roof, altitude | Can affect pressing, passing speed, fatigue, and long-ball/set-piece value. |
| Player condition | Knock status, minutes restriction, recent injury return, fatigue | Changes player props, team xG, defensive reliability, and substitution risk. |
| Rest and travel | Days since last match, travel distance, time zone, extra-time history | Can reduce pressing intensity and late-game defensive stability. |
| Tactical matchup | High line vs pace, low block vs crossing, set-piece edge | Determines whether the right market is BTTS, handicap, total, or team total. |
| Referee profile | Cards per game, penalty tendency, foul threshold | Useful for cards, penalties, set pieces, and tempo interruption. |
| Crowd/fan split | Home advantage, diaspora edge, hostile neutral venue | Can affect momentum, referee pressure, and underdog confidence. |
| Market movement | Opening price vs current price vs closing price | Helps identify whether information is already priced in. |

Adjustment rule:

> Only adjust the model when the factor can be translated into a clear probability or xG effect. If the adjustment cannot be explained before the match, it is probably narrative noise.

Example xG-style adjustments:

| Situation | Possible adjustment |
|---|---:|
| Star striker confirmed out | -0.15 to -0.40 team xG, depending on dependency and replacement quality. |
| Defensive leader out | +0.10 to +0.30 opponent xG. |
| Extreme heat and humidity | -3% to -8% tempo/total-goals reduction. |
| Strong wind | Reduce long shots/crossing quality; often lower total xG or finishing conversion. |
| Team on short rest after extra time | Reduce pressing/late defensive stability; can raise opponent late-goal risk. |
| Strong diaspora/home-like crowd | Small confidence/tempo adjustment; more useful for handicap/double chance than moneyline. |

## 4. Match the market to the expected script

| Match script | Preferred market |
|---|---|
| Favorite dominates but opponent is compact | Win + Under, modest Asian handicap, team clean-sheet markets. |
| Favorite has attacking depth and opponent concedes often | Favorite team total Over. |
| Favorite may win but rotate heavily | Avoid large handicaps; consider win + Under or underdog handicap. |
| Underdog can score but defends badly | BTTS Yes or Over, not underdog handicap. |
| Underdog is organized but has limited attack | Underdog handicap or Under, not BTTS Yes. |
| Team only needs draw | Double chance / +0.5 can be better than moneyline. |
| Knockout match with clear favorite | Avoid short 90-minute ML unless price is strong; consider to-qualify, Asian handicap, or result + total. |

## 5. Price discipline

Minimum target currently used: **1.70 decimal odds**.

However, odds must be judged against true risk:

- 1.70 requires about 58.82% win probability to break even.
- 1.80 requires about 55.56%.
- 1.90 requires about 52.63%.
- 2.00 requires 50%.

A bet can be logical but still bad if the market price is too short.

## 6. Market comparison rules

Do not compare only by payout. Compare settlement behavior.

Example: **Team total Over 2.5** vs **-2.25 Asian Handicap**

| Score | Team total Over 2.5 | -2.25 Asian Handicap |
|---|---:|---:|
| 2-0 | Lose | Half loss |
| 3-0 | Win | Win |
| 3-1 | Win | Half loss |
| 4-0 | Win | Win |

The better market depends on whether the risk is conceding a goal, not scoring enough, or failing to win by margin.

## 7. Post-match review

For each match, track both:

1. **Result quality**: Did the recommended bet win?
2. **Process quality**: Was the reasoning correct even if the result was unlucky?

A late collapse can make a good underdog handicap lose. A rotated attack can still score enough to make an over win. The post-match review should record what actually mattered.
