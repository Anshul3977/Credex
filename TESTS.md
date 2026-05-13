# Tests

## Running Tests
```bash
npm test
```

## Test Files

### lib/__tests__/auditEngine.test.ts
Covers the core audit engine logic.

| # | Test | What it covers |
|---|------|---------------|
| 1 | Team plan with 2 seats flags as overkill | Rule 1: wrong plan size |
| 2 | Solo dev on Copilot Business → downgrade to Individual | Rule 1: seat savings math |
| 3 | Claude Pro + Anthropic API flags redundancy | Rule 4c: redundancy detection |
| 4 | Optimal setup returns spending well | Rule 6: honesty |
| 5 | Spend >$200 triggers Credex upsell | Rule 5: credits opportunity |
| 6 | Spend ≤$200 does NOT trigger Credex upsell | Rule 5: threshold boundary |
| 7 | Annual savings = monthly × 12 | Arithmetic correctness |
| 8 | ChatGPT Team for writing → surfaces Claude alternative | Rule 4b: alternatives |
| 9 | Correctly sized individual plan not flagged | Rule 1: no false positives |
| 10 | Multiple tools annual savings sum correctly | Rule 7: multi-tool math |
| 11 | Empty tools array handled gracefully | Edge case: no crash |
| 12 | Missing optional fields don't crash engine | Edge case: robustness |
