# France vs Sweden — refined 1xBet calculation with lineup/news context

Source: user-uploaded 1xBet CSV snapshot on 2026-06-30 plus latest accessible team-news sources.

## Lineup/news status

No official verified starting XI was available from accessible sources at the time of this update. The latest published expected lineup is:

- **France expected XI (4-2-3-1):** Maignan; Koundé, Upamecano, Saliba, Theo Hernández; Tchouaméni, Rabiot; Dembélé, Olise, Doué; Mbappé.
- **Sweden expected XI (4-4-2):** Nordfeldt; Lagerbielke, Lindelöf, Bergvall, Gudmundsson; Bernhardsson, Karlström, Ayari, Elanga; Gyökeres, Isak.

Key news:

- France intend to keep their attacking approach after scoring 10 group-stage goals.
- Marcus Thuram is ruled out.
- N'Golo Kanté is doubtful / likely bench.
- William Saliba is managing a back issue but is expected to feature.
- Sweden are without Isak Hien, a major central-defensive loss.
- Sweden still carry threat through Gyökeres, Isak and Elanga.
- East Rutherford / New Jersey is affected by heat-dome conditions. This slightly lowers tempo and over confidence.

## Refined xG model

The previous model used France 2.35 / Sweden 1.00. After adding the heat and Saliba context, the conservative model becomes:

| Team | Base xG | Key adjustments | Final xG |
|---|---:|---|---:|
| France | 2.15 | +0.10 attacking posture, +0.15 Hien absence, +0.05 strong expected front four, -0.15 heat/knockout caution | 2.30 |
| Sweden | 0.95 | +0.10 scoring profile/counter threat, -0.05 Saliba expected, -0.05 heat/knockout caution | 0.95 |

## Conservative model probabilities

| Output | Probability |
|---|---:|
| France win | 67.66% |
| Draw | 18.27% |
| Sweden win | 14.07% |
| Over 2.5 | 63.04% |
| Over 3.5 | 40.86% |
| BTTS Yes | 55.18% |
| France 3+ team goals | 40.40% |
| Sweden 1+ team goals | 61.33% |

Top score cluster:

| Score | Probability |
|---|---:|
| 2-0 | 10.26% |
| 2-1 | 9.74% |
| 1-0 | 8.92% |
| 1-1 | 8.47% |
| 3-0 | 7.86% |
| 3-1 | 7.47% |
| 2-2 | 4.63% |
| 4-0 | 4.52% |

## Latest 1xBet market snapshot

| Market | Odds | Raw implied probability |
|---|---:|---:|
| France ML | 1.333 | 75.02% |
| Draw | 6.16 | 16.23% |
| Sweden ML | 9.65 | 10.36% |
| BTTS Yes | 1.84 | 54.35% |
| BTTS No | 1.881 | 53.16% |
| France -1.5 | 1.839 | 54.38% |
| Sweden +1.5 | 2.03 | 49.26% |
| Sweden AH +1.75 | 1.829 | 54.67% |
| Sweden Asian team total Over 0.75 | 2.04 | 49.02% |
| France Asian team total Under 2.25 | 2.04 | 49.02% |

## EV ranking under conservative model

| Market | Odds | Model fair odds | EV / 1u | Verdict |
|---|---:|---:|---:|---|
| Sweden +1.5 handicap | 2.03 | 1.809 | +0.1220 | Value candidate, but exposed to 2-0 / 3-1 France |
| Sweden AH +1.75 | 1.829 | 1.627 | +0.1114 | Value candidate, half-loss on France by exactly 2 |
| France Asian team total Under 2.25 | 2.04 | 1.872 | +0.0780 | Value candidate, but uncomfortable vs France attack |
| Sweden Asian team total Over 0.75 | 2.04 | 1.900 | +0.0600 | Best pure Sweden-scoring angle |
| Asian Total Under 3.25 | 1.90 | 1.850 | +0.0238 | Thin edge only |
| BTTS Yes | 1.84 | 1.812 | +0.0153 | Playable but thin after heat/Saliba adjustment |

## Market-calibrated caution scenario

Fitting the market's 1X2 and Over/Under 3.5 prices implies approximately:

| Team | Market-implied xG |
|---|---:|
| France | 2.54 |
| Sweden | 0.86 |

Under that market-calibrated scenario, BTTS Yes, Sweden TT Over 0.75, and Sweden +1.75 become slightly negative EV. Therefore, the edge depends on believing Sweden's true attacking xG is closer to **0.95–1.00** than the market-implied **0.85–0.86**.

## Refined recommendation

1. **Sweden Asian team total Over 0.75 @ 2.04** — best sharp value if we accept Sweden scoring probability is underpriced.
2. **BTTS Yes @ 1.84** — simpler version, but now a thinner edge after heat and Saliba adjustment.
3. **Sweden AH +1.75 @ 1.829** — strong model EV, but less aligned with the main scoring thesis and vulnerable to France 2-goal win.

Avoid:

- France ML @ 1.333: too short.
- France -1.5 @ 1.839: margin risk too high.
- France AH -1.75 @ 2.042: poor settlement risk.
- France team total Over 2.5 @ ~2.04: model gives only about 40% for France 3+ under conservative conditions.
- France win + BTTS @ 2.50: too many conditions.
