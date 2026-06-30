# France vs Sweden — latest 1xBet odds calculation

Source: user-uploaded 1xBet CSV snapshot on 2026-06-30.

## Model assumptions

Structured adjusted model:

| Team | Base xG | Adjustments | Final xG |
|---|---:|---|---:|
| France | 2.15 | +0.10 attacking posture, +0.15 Sweden defensive absence, -0.05 knockout caution | 2.35 |
| Sweden | 0.95 | +0.10 scoring profile, -0.05 knockout caution | 1.00 |

This is the research model, not a guaranteed truth. The main disagreement with the market is Sweden scoring probability.

## Market snapshot

| Market | Odds | Raw implied probability | No-vig probability where available |
|---|---:|---:|---:|
| France ML | 1.333 | 75.02% | 73.83% |
| Draw | 6.16 | 16.23% | 15.98% |
| Sweden ML | 9.65 | 10.36% | 10.20% |
| BTTS Yes | 1.84 | 54.35% | 50.55% |
| BTTS No | 1.881 | 53.16% | 49.45% |
| Over 3.5 | 2.195 | 45.56% | 43.96% |
| Under 3.5 | 1.722 | 58.07% | 56.04% |

## Research-model probabilities

| Output | Probability |
|---|---:|
| France win | 67.43% |
| Draw | 18.07% |
| Sweden win | 14.50% |
| Over 2.5 | 65.05% |
| Over 3.5 | 43.07% |
| BTTS Yes | 57.18% |

Top score probabilities:

| Score | Probability |
|---|---:|
| 2-0 | 9.69% |
| 2-1 | 9.69% |
| 1-0 | 8.24% |
| 1-1 | 8.24% |
| 3-0 | 7.59% |
| 3-1 | 7.59% |
| 2-2 | 4.84% |
| 4-0 | 4.46% |

## EV ranking under research model

| Market | Odds | Model fair odds | EV / 1u | Verdict |
|---|---:|---:|---:|---|
| Sweden Handicap +1.5 | 2.03 | 1.814 | +0.1193 | Value candidate |
| Sweden AH +1.75 | 1.829 | 1.633 | +0.1079 | Value candidate |
| Sweden Asian team total Over 0.75 | 2.04 | 1.821 | +0.0982 | Value candidate |
| Sweden AH +2.25 | 1.477 | 1.384 | +0.0607 | Below user's minimum odds target |
| BTTS Yes | 1.84 | 1.749 | +0.0522 | Value candidate |
| France Asian team total Under 2.25 | 2.04 | 1.925 | +0.0520 | Value candidate |
| France team total Under 2.5 | 1.78 | 1.716 | +0.0374 | Value candidate |
| Sweden team total Over 0.5 | 1.64 | 1.582 | +0.0367 | Below user's minimum odds target |

## Markets rejected by model

| Market | Odds | EV / 1u | Reason |
|---|---:|---:|---|
| France ML | 1.333 | -0.1012 | Price too short and below target |
| France -1.5 | 1.839 | -0.1749 | Model does not support two-goal-margin requirement |
| France AH -1.75 | 2.042 | -0.1875 | Too dependent on France winning by 2+ |
| France team total Over 2.5 | 2.04 | -0.1490 | Model gives only 41.72% for 3+ France goals |
| Over 3.5 | 2.195 | -0.0547 | Price not enough under 3.35 total xG |
| France win + BTTS Yes | 2.50 | -0.1463 | Too many conditions: France win plus Sweden score |
| France win + Over 2.5 | 1.74 | -0.1388 | Over condition plus France-win condition is overpriced |

## Market-calibrated caution scenario

Fitting the market's 1X2 and total prices gives a rough implied split around France 2.52 xG and Sweden 0.85 xG. Under that scenario:

| Market | Odds | EV / 1u | Verdict |
|---|---:|---:|---|
| BTTS Yes | 1.84 | -0.0312 | No value |
| Sweden Asian team total Over 0.75 | 2.04 | -0.0208 | No value |
| Sweden AH +1.75 | 1.829 | -0.0116 | No value |

So the research edge depends on one key assumption: Sweden's attacking xG should be closer to 1.00 than the market-implied 0.80–0.85.

## Recommendation

Main pick remains **BTTS Yes @ 1.84**, but with a clear condition:

> Bet only if we accept Sweden goal probability as underpriced by the market.

Best model-supported alternatives:

1. Sweden Asian team total Over 0.75 @ 2.04
2. Sweden +1.75 Asian Handicap @ 1.829
3. Sweden +1.5 Handicap @ 2.03

Avoid forcing France ML, France -1.5, France AH -1.75, France team total Over 2.5, and France win + BTTS Yes.
