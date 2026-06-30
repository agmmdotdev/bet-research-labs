# 1xBet Humanizer Script Review

Date: 2026-06-30

## Review scope

Reviewed the updated `humanize-1xbet-odds.js` script and companion CLI notes uploaded by the user.

The updated script supports:

- search-only mode via `Web_SearchZip`,
- search + select + `GetGameZip`,
- direct `--game-id` fetch,
- saved raw `GetGameZip` input conversion,
- template chunk loading from 1xBet bet-template catalogs,
- human-readable JSON/CSV output,
- summary output,
- fallback row confidence when templates do not resolve.

## Static checks

Command:

```bash
node --check /mnt/data/8a0522fe-34e6-4ba6-b384-31e0c75eeab9.js
```

Result:

```text
Pass: no syntax errors.
```

Help output also rendered successfully with:

```bash
node /mnt/data/8a0522fe-34e6-4ba6-b384-31e0c75eeab9.js --help
```

## Live endpoint check

Attempted live search:

```bash
node humanize-1xbet-odds.js --search "france sweden" --limit 3 --out-dir /mnt/data/1xbet-test
```

Result in this execution environment:

```text
TypeError: fetch failed
```

DNS checks:

```text
1x-bet-mm.com: Temporary failure in name resolution
mm.1xbet.com: Temporary failure in name resolution
```

Conclusion: live 1xBet API/template access is **not confirmed from this environment** because both domains failed DNS resolution. This does not prove the endpoints are invalid; it means the current container cannot resolve them.

## Mocked end-to-end test

Because live DNS failed, a local HTTP mock server was created to simulate:

- `/service-api/LineFeed/Web_SearchZip`,
- `/service-api/LineFeed/GetGameZip`,
- `/genfiles/cms/betstemplates/bets_model_map_short_en.json`,
- `/genfiles/cms/betstemplates/bets_model_short_en_0.json`,
- `/genfiles/cms/betstemplates/bets_model_short_en_1.json`.

The script constants were patched locally to point to `http://127.0.0.1:34567` only for testing.

### Search-only test

Command:

```bash
node humanize-1xbet-odds.js --search "france sweden" --limit 5 --out-dir outputs
```

Result:

```json
{
  "query": "france sweden",
  "matches": [
    {
      "index": 1,
      "game_id": 732163048,
      "canonical_url_game_id": 345000111,
      "sport": "Football",
      "league": "World Cup 2026",
      "country": "World",
      "team1": "France",
      "team2": "Sweden",
      "start_unix": 1782853200,
      "start_iso_utc": "2026-06-30T21:00:00.000Z",
      "markets_count": 5,
      "headline_odds": {
        "team1": "1.333",
        "draw": "6.16",
        "team2": "9.65"
      }
    }
  ]
}
```

### Search + select + humanize test

Command:

```bash
node humanize-1xbet-odds.js --search "france sweden" --select 1 --out-dir outputs
```

Result:

```json
{
  "game_id": 732163048,
  "rows": 6,
  "template_rows": 6,
  "fallback_rows": 0,
  "files": {
    "raw": ".../france-sweden-732163048-raw.json",
    "csv": ".../france-sweden-732163048-human-readable.csv",
    "json": ".../france-sweden-732163048-human-readable.json",
    "summary": ".../france-sweden-732163048-summary.json"
  }
}
```

CSV output correctly humanized:

```text
1X2,Full time result,France,...,1.333,...,template
1X2,Full time result,Draw,...,6.16,...,template
1X2,Full time result,Sweden,...,9.65,...,template
Total Goals,Main total,Over 2.5,...,1.55,...,template
Total Goals,Main total,Under 2.5,...,2.36,...,template
Player Shots,Player shots on target,Kylian Mbappe 1+ shot on target,...,1.95,...,template
```

### Direct `--game-id` test

Command:

```bash
node humanize-1xbet-odds.js --game-id 732163048 --out-dir outputs2 --no-write-raw
```

Result:

```json
{
  "game_id": 732163048,
  "rows": 6,
  "template_rows": 6,
  "fallback_rows": 0,
  "files": {
    "raw": "",
    "csv": ".../france-sweden-732163048-human-readable.csv",
    "json": ".../france-sweden-732163048-human-readable.json",
    "summary": ".../france-sweden-732163048-summary.json"
  }
}
```

This confirms `--no-write-raw` works as designed.

### Saved `--input` test

Command:

```bash
node humanize-1xbet-odds.js --input france-sweden-732163048-raw.json --out-dir outputs3
```

Result:

```json
{
  "game_id": 732163048,
  "rows": 6,
  "template_rows": 6,
  "fallback_rows": 0,
  "api_url": ""
}
```

This confirms saved raw `GetGameZip` conversion works, assuming template downloads are available.

### Fallback confidence test

A raw input with unknown market group `999` and unknown outcome `555` produced:

```text
market:999,market:999,outcome:555,...,id_fallback
```

Summary:

```json
{
  "rows": 1,
  "template_rows": 0,
  "fallback_rows": 1
}
```

This confirms the fallback path works.

## Confirmed behavior

Confirmed locally:

- Syntax is valid.
- Help output is valid.
- Search-only JSON structure is correct under a mocked API.
- `--search --select` fetches and humanizes a selected game under a mocked API.
- `--game-id` fetches and humanizes under a mocked API.
- `--input` converts saved raw JSON.
- Template chunk loading works.
- `^1^`, `^2^`, `W1`, `W2`, `X`, `()`, and `[]` replacement paths work in the tested cases.
- CSV output columns match the documented stable columns.
- Summary output correctly counts rows, template rows, fallback rows, API event count, and UI all-markets count.
- Fallback confidence correctly becomes `id_fallback` when a template is missing.

## Remaining risks / recommended fixes

| Issue | Severity | Recommendation |
|---|---|---|
| Live DNS/API access not confirmed here | High | Run from the user's local machine/VPS where 1xBet domains resolve. |
| Missing flag-value validation | Medium | Add `readValue()` so `--input`, `--search`, `--select`, etc. cannot silently consume `undefined` or another flag. |
| Numeric argument validation | Medium | Validate `--limit`, `--country`, `--partner`, `--cfview`, and `--mode` are finite numbers. |
| Requires Node 18+ global `fetch` | Medium | Document Node 18+ requirement or import `undici`. |
| Template catalog shape assumptions | Low-medium | Add defensive validation for template chunks. |
| `--input` output returns `files.raw: ""` | Low | Acceptable, but consider returning the input path for clarity. |
| `findChunkId()` falls back to chunk `0` for unknown ranges | Low-medium | Keep fallback, but optionally warn in verbose mode. |

## Production-readiness verdict

Status: **locally confirmed with mocked end-to-end API/template flow; live 1xBet network access not confirmed in this environment.**

The script is good enough to run on the user's machine for real 1xBet testing. Before treating it as production-stable, add flag-value validation and numeric validation, then run a real live test against `--search "france sweden" --select 1` from an environment that can resolve the 1xBet domains.
