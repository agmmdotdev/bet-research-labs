# Modeling Approach

This document records the practical modeling direction for Bet Research Labs.

## Core thesis

The best practical betting model is not one standalone model. The strongest setup is an ensemble:

```text
Market odds baseline
+ sport-specific probability model
+ calibration layer
+ lineup/context adjustment
+ bankroll control
```

Betting is not mainly about predicting the winner. It is about comparing our estimated probability with the bookmaker's implied probability after removing margin.

Example:

```text
Our probability estimate: 62%
Market implied probability after margin adjustment: 55%
Potential value: yes

Our probability estimate: 62%
Market implied probability after margin adjustment: 65%
Potential value: no
```

## Football/soccer model stack

Recommended practical stack:

```text
Elo/team strength
+ xG-based Poisson or Dixon-Coles style score model
+ Skellam-style goal-difference view
+ lineup/injury/rotation adjustment
+ market odds calibration
+ bankroll and staking rules
```

Football is low-scoring, draw-heavy, and noisy. A plain win/loss classifier is weaker than a goal-distribution model because one score model can price multiple markets:

- 1X2
- double chance
- over/under
- BTTS
- Asian handicap
- team totals
- correct score
- win + total

## Workflow

### 1. Convert bookmaker odds into a no-vig baseline

For each market, convert decimal odds into implied probability:

```text
raw implied probability = 1 / decimal odds
```

Then remove bookmaker margin so the probabilities sum to 100% for the relevant market.

The market baseline is important because betting markets aggregate a lot of information. Our model should not ignore it.

### 2. Build an independent football probability model

Estimate expected goals for both teams.

Example:

```text
France expected goals: 2.15
Sweden expected goals: 1.05
```

Use Poisson-type score simulation to generate scoreline probabilities:

```text
0-0, 1-0, 1-1, 2-1, 3-1, etc.
```

From scorelines, derive market probabilities:

- France win probability
- draw probability
- Sweden win probability
- Over 2.5 probability
- BTTS Yes probability
- France -1.5 probability
- France team total Over 2.5 probability

### 3. Add context adjustments

The raw model must be adjusted for match-specific information:

| Adjustment | Why it matters |
|---|---|
| Confirmed lineup | Actual XI matters more than team brand. |
| Star scorer dependency | If one player scored most goals and is benched, reduce goal confidence. |
| Rotation | Strong squads can still lose scoring efficiency when heavily rotated. |
| Match incentive | A team needing only a draw changes the best market. |
| Knockout format | 90-minute draw risk matters. |
| Venue/fan split | Neutral venues can become home-like due to diaspora support. |
| Weather/pitch/travel | Can affect tempo and finishing quality. |

### 4. Calibrate the output

Raw models are often overconfident. Calibration should correct whether predicted probabilities match observed frequencies.

Example calibration check:

```text
When our model says 60-65%, how often does the event actually happen?
```

If events in that bucket only happen 55% of the time, the model is overconfident.

### 5. Find value, not winners

A bet is considered only when:

```text
our calibrated probability > no-vig market probability + required edge buffer
```

Suggested edge buffer by market:

| Market type | Minimum edge buffer |
|---|---:|
| High-liquidity 1X2 | 3-5 percentage points |
| Main totals | 3-5 percentage points |
| Asian handicap | 4-6 percentage points |
| Props / niche markets | 5-8+ percentage points |
| Same-game combinations | Higher caution; correlation is often mispriced against the bettor |

## Evaluation metrics

Track the model with proper probability metrics, not just win rate.

Recommended metrics:

| Metric | Purpose |
|---|---|
| Closing-line value | Did our price beat the closing market? |
| Log loss | Penalizes confident wrong probabilities. |
| Brier score | Measures probability forecast error. |
| Calibration curve | Checks if probability buckets are honest. |
| ROI by market type | Identifies where the edge is real or fake. |
| Process label | Separates good reasoning from lucky results. |

## Why not start with deep learning?

Deep learning can be useful with high-quality event/tracking data, but it is not the best first step for this project.

Reasons:

1. Small sample size for our tracked bets.
2. Football outcomes are noisy and low scoring.
3. Public data quality is inconsistent.
4. Deep models are easier to overfit and harder to debug.
5. Betting decisions need explainability because market selection matters.

Start with:

```text
Market baseline + Elo + xG Poisson/Dixon-Coles + calibration
```

Then only add more complex models if they improve out-of-sample calibration and closing-line value.

## Practical checklist before a bet

1. What is the market price and no-vig implied probability?
2. What is our independent probability estimate?
3. Has the estimate been calibrated?
4. Does the selected market match the expected match script?
5. Are lineups confirmed?
6. Are we double-counting the same information already priced by the market?
7. Is the edge large enough after bookmaker margin?
8. Does the bet fit bankroll rules?
9. What would make this bet wrong?
10. How will we review it after the match?

## Current conclusion

The proposed direction is correct:

> Use market odds as the baseline, add a football-specific goal model, adjust for lineup and context, calibrate probabilities, and stake with bankroll control.

The main correction is that the market should be treated as a strong prior. Our model must prove it improves on the market through calibration, closing-line value, and long-run ROI.
