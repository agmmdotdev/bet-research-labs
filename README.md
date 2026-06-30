# Bet Research Labs

A structured research notebook for football betting analysis. The goal is not to guess winners emotionally; it is to record assumptions, market prices, match context, and post-match lessons so the process can be audited over time.

## Core idea

A good bet is not simply “the better team wins.” A good bet is when the selected market fits the match script and the odds are high enough to justify the risk.

The working minimum price target used in the current research log is **1.70 decimal odds or higher**. That means a successful 1-unit stake returns roughly 0.70 units of profit. It does **not** mean the bet has a 70% chance of winning.

Breakeven examples:

| Decimal odds | Breakeven win rate |
|---:|---:|
| 1.70 | 58.82% |
| 1.80 | 55.56% |
| 1.90 | 52.63% |
| 2.00 | 50.00% |

## Repository structure

```text
.
├── README.md
├── data/
│   └── prediction-log.csv
├── docs/
│   ├── bankroll-rules.md
│   ├── betting-framework.md
│   ├── lessons-learned.md
│   ├── market-glossary.md
│   └── modeling-approach.md
└── templates/
    └── match-analysis-template.md
```

## Current operating principles

1. Start from match incentives: qualification state, must-win pressure, draw value, rotation risk, and knockout vs group-stage context.
2. Check lineup quality, not just team brand. Star absences and rotated attacks can change the best market.
3. Choose the market that matches the script: double chance, team total, Asian handicap, BTTS, win + total, or under/over.
4. Demand price discipline. A correct idea can still be a bad bet if the odds are too short.
5. Track the outcome and the process separately. A bad process can win; a good process can lose.
6. Treat bookmaker odds as the baseline, then test whether our calibrated football model improves on that baseline.

## Important disclaimer

This repository is for research and decision tracking. It does not provide guaranteed returns, financial advice, or encouragement to chase losses. Football betting is high variance, and profitable evaluation requires a large sample of tracked bets, not a short hot streak.
